import { SuiEvent } from "@mysten/sui/dist/cjs/client";
import { IEvent } from "@src/indexer/db/dbConstants";
import { logInfo } from "@src/util/logger";
import {
    RawCancelOrderEvent,
    RawGlobalMarketsEnabledUpdatedEvent,
    RawGlobalMarketsVersionMigratedEvent,
    RawMarketAddedEvent,
    RawMarketParamUpdatedEvent,
    RawModifyPositionEvent,
    RawOrderExecutedEvent,
    RawPositionLiquidatedEvent,
    RawProtocolFundsWithdrawnEvent,
    RawRewardsClaimedEvent,
    RawStakeEvent,
    RawUnstakeEvent,
    RawWithdrawMarginEvent,
} from "@src/indexer/interfaces";
import {
    ICancelOrderEvent,
    insertCancelOrderEvent,
} from "@src/indexer/db/schema/cancelOrderEvents";
import {
    IMarketAddedEvent,
    insertMarketAddedEvent,
} from "@src/indexer/db/schema/marketAddedEvents";
import {
    IMarketParamUpdatedEvent,
    insertMarketParamUpdatedEvent,
} from "@src/indexer/db/schema/marketParamUpdatedEvents";
import {
    IModifyPositionEvent,
    insertModifyPositionEvent,
} from "@src/indexer/db/schema/modifyPositionEvents";
import {
    insertOrderExecutedEvent,
    IOrderExecutedEvent,
} from "@src/indexer/db/schema/orderExecutedEvents";
import {
    insertPositionLiquidatedEvent,
    IPositionLiquidatedEvent,
} from "@src/indexer/db/schema/positionLiquidatedEvents";
import {
    insertProtocolFundsWithdrawnEvent,
    IProtocolFundsWithdrawnEvent,
} from "@src/indexer/db/schema/protocolFundsWithdrawnEvents";
import {
    insertRewardsClaimedEvent,
    IRewardsClaimedEvent,
} from "@src/indexer/db/schema/rewardsClaimedEvents";
import {
    insertStakeEvent,
    IStakeEvent,
} from "@src/indexer/db/schema/stakeEvents";
import {
    insertUnstakeEvent,
    IUnstakeEvent,
} from "@src/indexer/db/schema/unstakeEvents";
import {
    insertWithdrawMarginEvent,
    IWithdrawMarginEvent,
} from "@src/indexer/db/schema/withdrawMarginEvents";
import {
    IGlobalMarketsEnbaledUpdatedEvent,
    insertGlobalMarketsEnabledUpdatedEvent,
} from "@src/indexer/db/schema/globalMarketsEnabledUpdatedEvents";
import {
    IGlobalMarketsVersionMigratedEvent,
    insertGlobalMarketsVersionMigratedEvent,
} from "@src/indexer/db/schema/globalMarketsVersionMigratedEvents";

export async function handleStakeEvent(event: SuiEvent) {
    const market = getMarket(event.type);
    const readableMarket = getReadableMarket(market);
    const stakeData = event.parsedJson as RawStakeEvent;
    const stakeDataStr = JSON.stringify(stakeData, null, 4);
    logInfo(
        null,
        `Processing stake event in ${readableMarket} market: ${stakeDataStr}`
    );
    const stakeEvent: IStakeEvent = {
        ...parseEmittedEvent(event, market),
        account: stakeData.account,
        shares: stakeData.shares,
        amount: stakeData.amount,
        isReinvest: String(stakeData.is_reinvest),
    };
    await insertStakeEvent(stakeEvent);
}

export async function handleUnstakeEvent(event: SuiEvent) {
    const market = getMarket(event.type);
    const readableMarket = getReadableMarket(market);
    const unstakeData = event.parsedJson as RawUnstakeEvent;
    const unstakeDataStr = JSON.stringify(unstakeData, null, 4);
    logInfo(
        null,
        `Processing unstake event in ${readableMarket} market: ${unstakeDataStr}`
    );
    const unstakeEvent: IUnstakeEvent = {
        ...parseEmittedEvent(event, market),
        account: unstakeData.account,
        shares: unstakeData.shares,
        amount: unstakeData.amount,
        isFullRedeem: String(unstakeData.is_full_redeem),
    };
    await insertUnstakeEvent(unstakeEvent);
}

export async function handleRewardsClaimedEvent(event: SuiEvent) {
    const market = getMarket(event.type);
    const readableMarket = getReadableMarket(market);
    const rewardsClaimedData = event.parsedJson as RawRewardsClaimedEvent;
    const rewardsClaimedDataStr = JSON.stringify(rewardsClaimedData, null, 4);
    logInfo(
        null,
        `Processing rewards claimed event in ${readableMarket} market: ${rewardsClaimedDataStr}`
    );
    const rewardsClaimedEvent: IRewardsClaimedEvent = {
        ...parseEmittedEvent(event, market),
        account: rewardsClaimedData.account,
        reward: rewardsClaimedData.reward,
    };
    await insertRewardsClaimedEvent(rewardsClaimedEvent);
}

export async function handleModifyPositionEvent(event: SuiEvent) {
    const market = getMarket(event.type);
    const readableMarket = getReadableMarket(market);
    const modifyPositionData = event.parsedJson as RawModifyPositionEvent;
    const modifyPositionDataStr = JSON.stringify(modifyPositionData, null, 4);
    logInfo(
        null,
        `Processing modify position event in ${readableMarket} market: ${modifyPositionDataStr}`
    );
    const modifyPositionEvent: IModifyPositionEvent = {
        ...parseEmittedEvent(event, market),
        account: modifyPositionData.account,
        sizeDelta: modifyPositionData.size_delta,
        sizeDeltaDirection: String(modifyPositionData.size_delta_direction),
        limitPrice: modifyPositionData.limit_price,
        margin: modifyPositionData.margin,
    };
    await insertModifyPositionEvent(modifyPositionEvent);
}

export async function handleWithdrawMarginEvent(event: SuiEvent) {
    const market = getMarket(event.type);
    const readableMarket = getReadableMarket(market);
    const withdrawMarginData = event.parsedJson as RawWithdrawMarginEvent;
    const withdrawMarginDataStr = JSON.stringify(withdrawMarginData, null, 4);
    logInfo(
        null,
        `Processing withdraw margin event in ${readableMarket} market: ${withdrawMarginDataStr}`
    );
    const withdrawMarginEvent: IWithdrawMarginEvent = {
        ...parseEmittedEvent(event, market),
        account: withdrawMarginData.account,
        margin: withdrawMarginData.margin,
    };
    await insertWithdrawMarginEvent(withdrawMarginEvent);
}

export async function handleCancelOrderEvent(event: SuiEvent) {
    const market = getMarket(event.type);
    const readableMarket = getReadableMarket(market);
    const cancelOrderData = event.parsedJson as RawCancelOrderEvent;
    const cancelOrderDataStr = JSON.stringify(cancelOrderData, null, 4);
    logInfo(
        null,
        `Processing cancel order event in ${readableMarket} market: ${cancelOrderDataStr}`
    );
    const cancelOrderEvent: ICancelOrderEvent = {
        ...parseEmittedEvent(event, market),
        account: cancelOrderData.account,
        sizeDelta: cancelOrderData.size_delta,
        sizeDeltaDirection: String(cancelOrderData.size_delta_direction),
        limitPrice: cancelOrderData.limit_price,
        margin: cancelOrderData.margin,
        createdTime: cancelOrderData.created_time,
    };
    await insertCancelOrderEvent(cancelOrderEvent);
}

export async function handlePositionLiquidatedEvent(event: SuiEvent) {
    const market = getMarket(event.type);
    const readableMarket = getReadableMarket(market);
    const positionLiquidatedData =
        event.parsedJson as RawPositionLiquidatedEvent;
    const positionLiquidatedDataStr = JSON.stringify(
        positionLiquidatedData,
        null,
        4
    );
    logInfo(
        null,
        `Processing position liquidated event in ${readableMarket} market: ${positionLiquidatedDataStr}`
    );
    const positionLiquidatedEvent: IPositionLiquidatedEvent = {
        ...parseEmittedEvent(event, market),
        account: positionLiquidatedData.account,
        amountLiquidated: positionLiquidatedData.amount_liquidated,
        liquidator: positionLiquidatedData.liquidator,
        keeperReward: positionLiquidatedData.keeper_reward,
    };
    await insertPositionLiquidatedEvent(positionLiquidatedEvent);
}

export async function handleOrderExecutedEvent(event: SuiEvent) {
    const market = getMarket(event.type);
    const readableMarket = getReadableMarket(market);
    const orderExecutedData = event.parsedJson as RawOrderExecutedEvent;
    const orderExecutedDataStr = JSON.stringify(orderExecutedData, null, 4);
    logInfo(
        null,
        `Processing order executed event in ${readableMarket} market: ${orderExecutedDataStr}`
    );
    const orderExecutedEvent: IOrderExecutedEvent = {
        ...parseEmittedEvent(event, market),
        account: orderExecutedData.account,
        executor: orderExecutedData.executor,
        fillPrice: orderExecutedData.fill_price,
        oraclePrice: orderExecutedData.oracle_price,
        sizeDelta: orderExecutedData.size_delta,
        sizeDeltaDirection: String(orderExecutedData.size_delta_direction),
        limitPrice: orderExecutedData.limit_price,
        margin: orderExecutedData.margin,
    };
    await insertOrderExecutedEvent(orderExecutedEvent);
}

export async function handleMarketAddedEvent(event: SuiEvent) {
    const market = getMarket(event.type);
    const readableMarket = getReadableMarket(market);
    const marketAddedData = event.parsedJson as RawMarketAddedEvent;
    const marketAddedDataStr = JSON.stringify(marketAddedData, null, 4);
    logInfo(
        null,
        `Processing market added event in ${readableMarket} market: ${marketAddedDataStr}`
    );
    const marketAddedEvent: IMarketAddedEvent = {
        ...parseEmittedEvent(event, market),
        marketName: marketAddedData.market_name,
        marketId: marketAddedData.market_id,
    };
    await insertMarketAddedEvent(marketAddedEvent);
}

export async function handleMarketParamUpdatedEvent(event: SuiEvent) {
    const market = getMarket(event.type);
    const readableMarket = getReadableMarket(market);
    const marketParamData = event.parsedJson as RawMarketParamUpdatedEvent;
    const marketParamDataStr = JSON.stringify(marketParamData, null, 4);
    logInfo(
        null,
        `Processing market param updated event in ${readableMarket} market: ${marketParamDataStr}`
    );
    const marketParamUpdatedEvent: IMarketParamUpdatedEvent = {
        ...parseEmittedEvent(event, market),
        paramName: marketParamData.param_name,
        paramValue: String(marketParamData.param_value),
    };
    await insertMarketParamUpdatedEvent(marketParamUpdatedEvent);
}

export async function handleProtocolFundsWithdrawnEvent(event: SuiEvent) {
    const protocolFundsWithdrawnData =
        event.parsedJson as RawProtocolFundsWithdrawnEvent;
    const protocolFundsWithdrawnDataStr = JSON.stringify(
        protocolFundsWithdrawnData,
        null,
        4
    );
    logInfo(
        null,
        `Processing protocol funds withdrawn event: ${protocolFundsWithdrawnDataStr}`
    );
    const protocolFundsWithdrawnEvent: IProtocolFundsWithdrawnEvent = {
        ...parseEmittedEvent(event),
        amount: protocolFundsWithdrawnData.amount,
    };
    await insertProtocolFundsWithdrawnEvent(protocolFundsWithdrawnEvent);
}

export async function handleGlobalMarketsEnabledUpdatedEvent(event: SuiEvent) {
    const globalMarketsEnabledUpdatedData =
        event.parsedJson as RawGlobalMarketsEnabledUpdatedEvent;
    const globalMarketsEnabledUpdatedDataStr = JSON.stringify(
        globalMarketsEnabledUpdatedData,
        null,
        4
    );
    logInfo(
        null,
        `Processing global markets enabled updated event: ${globalMarketsEnabledUpdatedDataStr}`
    );
    const globalMarketsEnabledUpdatedEvent: IGlobalMarketsEnbaledUpdatedEvent =
        {
            ...parseEmittedEvent(event),
            val: String(globalMarketsEnabledUpdatedData.val),
        };
    await insertGlobalMarketsEnabledUpdatedEvent(
        globalMarketsEnabledUpdatedEvent
    );
}

export async function handleGlobalMarketsVersionMigratedEvent(event: SuiEvent) {
    const globalMarketsVersionMigratedData =
        event.parsedJson as RawGlobalMarketsVersionMigratedEvent;
    const globalMarketsVersionMigratedDataStr = JSON.stringify(
        globalMarketsVersionMigratedData,
        null,
        4
    );
    logInfo(
        null,
        `Processing global markets version migrated event: ${globalMarketsVersionMigratedDataStr}`
    );
    const globalMarketsVersionMigratedEvent: IGlobalMarketsVersionMigratedEvent =
        {
            ...parseEmittedEvent(event),
            prevVersion: globalMarketsVersionMigratedData.prev_version,
            newVersion: globalMarketsVersionMigratedData.new_version,
        };
    await insertGlobalMarketsVersionMigratedEvent(
        globalMarketsVersionMigratedEvent
    );
}

// Extracts a market from the entire type string like:
// 0x9e4e96d1dd8563da9cabc6a1a19287293cd3d21edfc636aa4622d43075b4b2e0::events::MarketParamUpdatedU64<0x018751cce488109992a68ccba3781590c01c54f089d5765e87434f109a713aa0::base_assets::BTC, 0x32acb908c1237d85ccf612e4eca2eb030fe70ff86a6b367bb7566a746ea9ae4a::usdc6::USDC6>
// returns { baseAsset: "0x018751cce488109992a68ccba3781590c01c54f089d5765e87434f109a713aa0::base_assets::BTC", quoteAsset: "0x32acb908c1237d85ccf612e4eca2eb030fe70ff86a6b367bb7566a746ea9ae4a::usdc6::USDC6" }
function getMarket(typeString: string): {
    baseAsset: string;
    quoteAsset: string;
} {
    const parts = typeString.split("<")[1].split(", ");
    return { baseAsset: parts[0], quoteAsset: parts[1].slice(0, -1) };
}

// Converts a market object into a readable string with no types, like BTC-USDC
function getReadableMarket(market: { baseAsset: string; quoteAsset: string }) {
    return `${market.baseAsset.split("::")[2]}-${
        market.quoteAsset.split("::")[2]
    }`;
}

// Parses the emitted event into a format that can be inserted into the db
// Not all events have a market associated with them, so the market is optional
function parseEmittedEvent(
    event: SuiEvent,
    market?: { baseAsset: string; quoteAsset: string }
): IEvent {
    const e: IEvent = {
        txDigest: event.id.txDigest,
        eventSeq: event.id.eventSeq,
        packageId: event.packageId,
        transactionModule: event.transactionModule,
        sender: event.sender,
        type: event.type,
        timestampMs: event.timestampMs,
    };
    if (market) {
        e.baseAsset = market.baseAsset;
        e.quoteAsset = market.quoteAsset;
    }
    return e;
}
