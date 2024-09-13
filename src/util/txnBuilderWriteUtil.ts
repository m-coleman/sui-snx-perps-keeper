import { TransactionArgument, TransactionBlock } from "@mysten/sui.js";
import {
    getMarketSuiTypes,
    getQuoteAssetCoinType,
} from "@src/markets/marketUtil";
import { Market } from "@src/markets/markets";
import {
    CLOCK_ADDR,
    GLOBAL_MARKETS_ID,
    PACKAGE_ID,
    TESTNET_SIGNER,
    TRADE_MODULE_ID,
    UPDATE_INTEREST_RATE_NUM_MOVE_CALLS,
} from "@src/util/constants";
import { getPythStateId } from "@src/util/environmentUtil";

export async function buildExecuteOrderTxn(
    txb: TransactionBlock,
    address: string,
    market: Market
) {
    const coinArg = txb.moveCall({
        target: `${PACKAGE_ID}::${TRADE_MODULE_ID}::execute_order`,
        typeArguments: getMarketSuiTypes(market),
        arguments: [
            txb.pure(address),
            txb.object(market.id),
            txb.object(GLOBAL_MARKETS_ID),
            txb.object(market.oracle.pythPriceInfoObjectId),
            txb.object(getPythStateId()),
            txb.object(CLOCK_ADDR),
        ],
    });
    const keeperAddress = await TESTNET_SIGNER.getAddress();
    buildPublicTransferCoinTxn(txb, coinArg, keeperAddress, market);
}

export async function buildLiquidatePositionTxn(
    txb: TransactionBlock,
    address: string,
    market: Market
) {
    const result = txb.moveCall({
        target: `${PACKAGE_ID}::${TRADE_MODULE_ID}::liquidate_position`,
        typeArguments: getMarketSuiTypes(market),
        arguments: [
            txb.pure(address),
            txb.object(market.id),
            txb.object(GLOBAL_MARKETS_ID),
            txb.object(market.oracle.pythPriceInfoObjectId),
            txb.object(getPythStateId()),
            txb.object(CLOCK_ADDR),
        ],
    });
    const keeperAddress = await TESTNET_SIGNER.getAddress();
    // liquidate_position returns (amount_liquidated, keeper_reward_coin), so make sure to transfer the keeper_reward_coin to ourselves
    buildPublicTransferCoinTxn(txb, result[1], keeperAddress, market);
}

export async function buildUpdateInterestRateTxn(
    txb: TransactionBlock,
    market: Market
): Promise<null[]> {
    txb.moveCall({
        target: `${PACKAGE_ID}::${TRADE_MODULE_ID}::update_interest_rate`,
        typeArguments: getMarketSuiTypes(market),
        arguments: [
            txb.object(market.id),
            txb.object(GLOBAL_MARKETS_ID),
            txb.object(market.oracle.pythPriceInfoObjectId),
            txb.object(getPythStateId()),
            txb.object(CLOCK_ADDR),
        ],
    });

    // push null onto the array for each return value of the update interest rate move call
    const parsingTemplate: null[] = [];
    for (let i = 0; i < UPDATE_INTEREST_RATE_NUM_MOVE_CALLS; i++) {
        parsingTemplate.push(null);
    }

    return parsingTemplate;
}

function buildPublicTransferCoinTxn(
    txb: TransactionBlock,
    coinArg: TransactionArgument,
    to: string,
    market: Market
): TransactionArgument {
    return txb.moveCall({
        target: "0x2::transfer::public_transfer",
        typeArguments: [getQuoteAssetCoinType(market)],
        arguments: [coinArg, txb.pure(to)],
    });
}
