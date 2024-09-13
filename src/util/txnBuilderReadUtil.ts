import { SUI_CLOCK_OBJECT_ID, TransactionBlock } from "@mysten/sui.js";
import { SuiClient, SuiParsedData } from "@mysten/sui/client";
import { MarketStruct } from "@src/contractStructs";
import { getMarketSuiTypes } from "@src/markets/marketUtil";
import { Market } from "@src/markets/markets";
import {
    GLOBAL_MARKETS_ID,
    MARKET_MODULE_ID,
    PACKAGE_ID,
    STATE_MODULE_ID,
    TESTNET_PROVIDER,
    TRADE_MODULE_ID,
} from "@src/util/constants";

export async function loadMarketObject(
    marketId: string
): Promise<MarketStruct> {
    const marketObj = await TESTNET_PROVIDER.getObject({
        id: marketId,
        options: { showContent: true, showDisplay: true },
    });

    if (!marketObj?.data?.content) {
        throw new Error(`Failed to parse market ${marketId}`);
    }

    const marketData = marketObj.data.content as SuiParsedData & {
        dataType: "moveObject";
    };

    const marketStruct = marketData.fields as unknown as MarketStruct;
    return marketStruct;
}

export function getValidOrderAddresses(
    txb: TransactionBlock,
    market: Market
): { validOrderAddresses: string[] } {
    txb.moveCall({
        target: `${PACKAGE_ID}::${TRADE_MODULE_ID}::valid_order_addresses`,
        typeArguments: getMarketSuiTypes(market),
        arguments: [txb.object(market.id), txb.object(SUI_CLOCK_OBJECT_ID)],
    });

    return { validOrderAddresses: [] };
}

export function getHasPosition(
    txb: TransactionBlock,
    address: string,
    market: Market
): { hasPosition: boolean } {
    const result = txb.moveCall({
        target: `${PACKAGE_ID}::${MARKET_MODULE_ID}::trade_state`,
        typeArguments: getMarketSuiTypes(market),
        arguments: [txb.object(market.id)],
    });
    txb.moveCall({
        target: `${PACKAGE_ID}::${STATE_MODULE_ID}::has_position`,
        typeArguments: [market.quoteAsset.suiType],
        arguments: [result[0], txb.pure(address)],
    });

    return { hasPosition: false };
}

export function getPositionAddresses(
    txb: TransactionBlock,
    market: Market
): { positionAddresses: string[] } {
    txb.moveCall({
        target: `${PACKAGE_ID}::${TRADE_MODULE_ID}::position_addresses`,
        typeArguments: getMarketSuiTypes(market),
        arguments: [txb.object(market.id)],
    });

    return { positionAddresses: [] };
}

export function getFlaggedAddresses(
    txb: TransactionBlock,
    market: Market
): { flaggedAddresses: string[] } {
    txb.moveCall({
        target: `${PACKAGE_ID}::${TRADE_MODULE_ID}::flagged_addresses`,
        typeArguments: getMarketSuiTypes(market),
        arguments: [txb.object(market.id)],
    });

    return { flaggedAddresses: [] };
}

export function getCanLiquidate(
    txb: TransactionBlock,
    address: string,
    market: Market
): { canLiquidate: boolean } {
    txb.moveCall({
        target: `${PACKAGE_ID}::${TRADE_MODULE_ID}::can_liquidate`,
        typeArguments: getMarketSuiTypes(market),
        arguments: [
            txb.object(market.id),
            txb.pure(address),
            txb.object(market.oracle.pythPriceInfoObjectId),
            txb.object(SUI_CLOCK_OBJECT_ID),
        ],
    });

    return { canLiquidate: false };
}

export function getNumLiqWindows(
    txb: TransactionBlock,
    address: string,
    market: Market
): { numLiqWindows: number } {
    txb.moveCall({
        target: `${PACKAGE_ID}::${TRADE_MODULE_ID}::num_liq_windows`,
        typeArguments: getMarketSuiTypes(market),
        arguments: [txb.object(market.id), txb.pure(address)],
    });

    return { numLiqWindows: 0 };
}

export function getMarketId(
    txb: TransactionBlock,
    market: Market
): { id: string } {
    txb.moveCall({
        target: `${PACKAGE_ID}::${MARKET_MODULE_ID}::get_market_id`,
        typeArguments: getMarketSuiTypes(market),
        arguments: [txb.object(GLOBAL_MARKETS_ID)],
    });

    return { id: "" };
}
