export type SnxEventType =
    | "StakeEvent"
    | "UnstakeEvent"
    | "RewardsClaimedEvent"
    | "ModifyPositionEvent"
    | "WithdrawMarginEvent"
    | "CancelOrderEvent"
    | "PositionLiquidatedEvent"
    | "OrderExecutedEvent"
    | "MarketAdded"
    | "MarketParamUpdatedU64"
    | "MarketParamUpdatedID"
    | "MarketParamUpdatedBool"
    | "ProtocolFundsWithdrawn"
    | "GlobalMarketsEnabledUpdated"
    | "GlobalMarketsVersionMigrated";

export interface RawStakeEvent {
    account: string;
    shares: string;
    amount: string;
    is_reinvest: boolean;
}

export interface RawUnstakeEvent {
    account: string;
    shares: string;
    amount: string;
    is_full_redeem: boolean;
}

export interface RawRewardsClaimedEvent {
    account: string;
    reward: string;
}

export interface RawModifyPositionEvent {
    account: string;
    size_delta: string;
    size_delta_direction: boolean;
    limit_price: string;
    margin: string;
}

export interface RawWithdrawMarginEvent {
    account: string;
    margin: string;
}

export interface RawCancelOrderEvent {
    account: string;
    size_delta: string;
    size_delta_direction: boolean;
    limit_price: string;
    margin: string;
    created_time: string;
}

export interface RawPositionLiquidatedEvent {
    account: string;
    amount_liquidated: string;
    liquidator: string;
    keeper_reward: string;
}

export interface RawOrderExecutedEvent {
    account: string;
    executor: string;
    fill_price: string;
    oracle_price: string;
    size_delta: string;
    size_delta_direction: boolean;
    limit_price: string;
    margin: string;
}

export interface RawMarketAddedEvent {
    market_name: string;
    market_id: string;
}

export interface RawMarketParamUpdatedEvent {
    param_name: string;
    param_value: any;
}

export interface RawProtocolFundsWithdrawnEvent {
    amount: string;
}

export interface RawGlobalMarketsEnabledUpdatedEvent {
    val: boolean;
}

export interface RawGlobalMarketsVersionMigratedEvent {
    prev_version: string;
    new_version: string;
}
