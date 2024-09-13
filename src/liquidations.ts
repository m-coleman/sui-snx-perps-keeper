import { TransactionBlock } from "@mysten/sui.js";
import { Market } from "@src/markets/markets";
import {
    TESTNET_SIGNER,
    UPDATE_INTEREST_RATE_NUM_MOVE_CALLS,
    UPDATE_PRICE_FEED_NUM_MOVE_CALLS,
} from "@src/util/constants";
import { logError, logInfo } from "@src/util/logger";
import { updatePriceFeed } from "@src/util/pythUtil";
import {
    devInspectTransactionBlock,
    parseKeeperBalanceChanges,
    parseTransactionResults,
} from "@src/util/suiUtil";
import {
    getCanLiquidate,
    getPositionAddresses,
} from "@src/util/txnBuilderReadUtil";
import {
    buildLiquidatePositionTxn,
    buildUpdateInterestRateTxn,
} from "@src/util/txnBuilderWriteUtil";
import { handleRpcBackoff } from "@src/util/util";

export async function processLiquidations(market: Market) {
    try {
        const positionAddresses: string[] = await fetchPositions(market);
        const liquidatablePositions: string[] = await getLiquidatablePositions(
            positionAddresses,
            market
        );
        await liquidatePositions(liquidatablePositions, market);
    } catch (e) {
        logError(market, "Error processing liquidations", e);
    }
}

export async function fetchPositions(market: Market): Promise<string[]> {
    const resultsTemplate = [];
    const txb = new TransactionBlock();
    resultsTemplate.push(getPositionAddresses(txb, market));
    const devInspectResults = await devInspectTransactionBlock(txb);
    parseTransactionResults(devInspectResults, resultsTemplate);
    const positionAddresses: string[] = resultsTemplate[0].positionAddresses;
    return positionAddresses;
}

// TODO: Make sure there is capacity to liquidate the positions. Sort by most profitable
async function getLiquidatablePositions(
    positionAddresses: string[],
    market: Market
): Promise<string[]> {
    const liquidateablePositionAddresses: string[] = [];
    if (positionAddresses.length === 0) {
        return liquidateablePositionAddresses;
    }

    const txb = new TransactionBlock();
    const resultsTemplate = [];
    const priceFeedUpdateTemplate = await updatePriceFeed(txb, market);
    // spread the price feed update template into the results template (we want to ignore all the oracle price feed update results)
    resultsTemplate.push(...priceFeedUpdateTemplate);
    const updateInterestRateTemplate = await buildUpdateInterestRateTxn(
        txb,
        market
    );
    // spread the update interest template into the results template (we want to ignore all the update results)
    resultsTemplate.push(...updateInterestRateTemplate);

    for (const address of positionAddresses) {
        resultsTemplate.push(getCanLiquidate(txb, address, market));
    }

    const devInspectResults = await devInspectTransactionBlock(txb);
    parseTransactionResults(devInspectResults, resultsTemplate);
    const offset =
        UPDATE_PRICE_FEED_NUM_MOVE_CALLS + UPDATE_INTEREST_RATE_NUM_MOVE_CALLS;
    for (let i = 0; i < positionAddresses.length; i++) {
        if (resultsTemplate[i + offset].canLiquidate) {
            liquidateablePositionAddresses.push(positionAddresses[i]);
        }
    }

    return liquidateablePositionAddresses;
}

async function liquidatePositions(positionAddresses: string[], market: Market) {
    if (positionAddresses.length === 0) {
        return;
    }

    const numPositions = positionAddresses.length;
    logInfo(
        market,
        `Found ${numPositions} liquidatable positions: ${positionAddresses}`
    );

    const txb = new TransactionBlock();
    await updatePriceFeed(txb, market);
    for (const address of positionAddresses) {
        await buildLiquidatePositionTxn(txb, address, market);
    }

    try {
        logInfo(
            market,
            `Dry running liquidation transactions for addresses ${positionAddresses}`
        );
        const dryRunResult = await TESTNET_SIGNER.dryRunTransactionBlock({
            transactionBlock: txb,
        });
        const isDryRunSuccess =
            dryRunResult.effects.status.status === "success";
        if (!isDryRunSuccess) {
            logError(
                market,
                `Dry run for liquidations failed for addresses \`${positionAddresses}\``,
                dryRunResult
            );
            return;
        }

        logInfo(
            market,
            `Dry run successful. Liquidating positions for addresses ${positionAddresses}`
        );

        await handleRpcBackoff();

        const result = await TESTNET_SIGNER.signAndExecuteTransactionBlock({
            transactionBlock: txb,
            options: {
                showBalanceChanges: true,
            },
            requestType: "WaitForLocalExecution", // wait for transaction finality
        });
        const isSuccess = result.confirmedLocalExecution;
        if (!isSuccess) {
            logError(
                market,
                `Failed to liquidate positions for addresses \`${positionAddresses}\``,
                result
            );
            return;
        }

        let msg = `Successfully liquidated positions for addresses \`${positionAddresses}\``;
        const resultString = JSON.stringify(result, null, 4);
        logInfo(market, `${msg}: ${resultString}`);

        // record balance changes (SUI spent/earned, quote asset earned)
        const keeperAddress = await TESTNET_SIGNER.getAddress();
        const { suiBalanceChange, quoteAssetBalanceChange } =
            parseKeeperBalanceChanges(
                result.balanceChanges,
                keeperAddress,
                market
            );
        if (quoteAssetBalanceChange > 0) {
            msg += `\n\tKeeper earned: \`${quoteAssetBalanceChange} ${market.quoteAsset.name}\` for processing ${numPositions} liquidation(s)`;
        }

        if (suiBalanceChange !== 0) {
            const word = suiBalanceChange > 0 ? "earned" : "paid";
            const absSuiBalanceChange = Math.abs(suiBalanceChange);
            msg += `\n\tKeeper ${word}: \`${absSuiBalanceChange} SUI\` for processing ${numPositions} liquidation(s)`;
        }

        logInfo(market, msg);
    } catch (e) {
        logError(
            market,
            `Error liquidating positions for addresses ${positionAddresses}`,
            e
        );
    }
}
