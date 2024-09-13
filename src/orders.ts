import { TransactionBlock } from "@mysten/sui.js";
import { Market } from "@src/markets/markets";
import { TESTNET_SIGNER } from "@src/util/constants";
import { logError, logInfo } from "@src/util/logger";
import { updatePriceFeed } from "@src/util/pythUtil";
import {
    devInspectTransactionBlock,
    parseKeeperBalanceChanges,
    parseTransactionResults,
} from "@src/util/suiUtil";
import { getValidOrderAddresses } from "@src/util/txnBuilderReadUtil";
import { buildExecuteOrderTxn } from "@src/util/txnBuilderWriteUtil";
import { handleRpcBackoff } from "@src/util/util";

export async function processOrders(market: Market) {
    try {
        const orderAddresses: string[] = await fetchOrders(market);
        await executeOrders(orderAddresses, market);
    } catch (e) {
        logError(market, "Error processing orders", e);
    }
}

export async function fetchOrders(market: Market): Promise<string[]> {
    const resultsTemplate = [];
    const txb = new TransactionBlock();
    resultsTemplate.push(getValidOrderAddresses(txb, market));
    const devInspectResults = await devInspectTransactionBlock(txb);
    parseTransactionResults(devInspectResults, resultsTemplate);
    const validOrderAddresses: string[] =
        resultsTemplate[0].validOrderAddresses;
    return validOrderAddresses;
}

async function executeOrders(orderAddresses: string[], market: Market) {
    if (orderAddresses.length === 0) {
        return;
    }

    const numOrders = orderAddresses.length;
    logInfo(market, `Found ${numOrders} orders to execute: ${orderAddresses}`);
    const txb = new TransactionBlock();
    await updatePriceFeed(txb, market);
    for (const address of orderAddresses) {
        await buildExecuteOrderTxn(txb, address, market);
    }

    try {
        logInfo(market, `Dry running orders: ${orderAddresses}`);
        const dryRunResult = await TESTNET_SIGNER.dryRunTransactionBlock({
            transactionBlock: txb,
        });
        const isDryRunSuccess =
            dryRunResult.effects.status.status === "success";
        if (!isDryRunSuccess) {
            logError(
                market,
                `Dry run failed for addresses ${orderAddresses}`,
                dryRunResult
            );
            return;
        }

        logInfo(
            market,
            `Dry run successful. Executing orders: ${orderAddresses}`
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
                `Failed to execute order for addresses \`${orderAddresses}\``,
                result
            );
            return;
        }

        let msg = `Successfully executed orders for addresses \`${orderAddresses}\``;
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
            msg += `\n\tKeeper earned: \`${quoteAssetBalanceChange} ${market.quoteAsset.name}\` for processing ${numOrders} order(s)`;
        }

        if (suiBalanceChange !== 0) {
            const word = suiBalanceChange > 0 ? "earned" : "paid";
            const absSuiBalanceChange = Math.abs(suiBalanceChange);
            msg += `\n\tKeeper ${word}: \`${absSuiBalanceChange} SUI\` for processing ${numOrders} order(s)`;
        }

        logInfo(market, msg);
    } catch (e) {
        logError(
            market,
            `Error executing order for addresses ${orderAddresses}`,
            e
        );
    }
}
