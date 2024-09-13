/// Structs defined in the contracts

export type GlobalMarketsStruct = {
    id: { id: string };
    markets: { fields: BagStruct };
    global_markets_enabled: boolean;
    version: string;
    admin_cap_id: string;
};

export interface MarketStruct {
    id: { id: string };
    trade_state: { fields: TradeStateStruct };
    stake_state: { fields: StakeStateStruct };
    trade_settings: { fields: TradeSettingsStruct };
    stake_settings: { fields: StakeSettingsStruct };
    vault: { fields: VaultStruct };
    pyth_price_info_object_id: string;
    decimals: string;
}

export type OrderStruct = {
    id: {
        id: string;
    };
    name: string;
    value: {
        type: string;
        fields: {
            limit_price: string;
            margin: string;
            size_delta: {
                type: string;
                fields: {
                    direction: boolean;
                    value: string;
                };
            };
            timestamp_ms: string;
        };
    };
};

export type PositionStruct = {
    id: {
        id: string;
    };
    name: string;
    value: {
        type: string;
        fields: {
            is_flagged: boolean;
            last_funding: {
                type: string;
                fields: {
                    direction: boolean;
                    value: string;
                };
            };
            last_price: string;
            latest_interest_accrued_pct: string;
            margin: string;
            size: {
                type: string;
                fields: {
                    direction: boolean;
                    value: string;
                };
            };
        };
    };
};

export interface TradeStateStruct {
    size: string;
    skew: { fields: I64Struct };
    entry_debt_correction: { fields: I64Struct };
    funding_last_recomputed: string;
    latest_funding: { fields: I64Struct };
    latest_funding_rate: { fields: I64Struct };
    orders: { fields: TableStruct };
    order_addresses: { fields: BigVectorStruct };
    positions: { fields: TableStruct };
    position_addresses: { fields: BigVectorStruct };
    interest_rate_data: { fields: InterestRateDataStruct };
    liquidation_window_data: { fields: LiquidationDataStruct }[];
}

export interface InterestRateDataStruct {
    lifetime_interest_accrued_pct: string;
    timestamp: string;
    weighted_outstanding_interest_pct: string;
}

export interface LiquidationDataStruct {
    amount: string;
    timestamp: string;
}

export interface StakeStateStruct {
    total_shares: string;
    cumulative_reward_per_share: string;
    fees_outstanding: string;
    stakes: { fields: TableStruct };
    rewards: { fields: TableStruct };
}

export interface StakeStruct {
    id: {
        id: string;
    };
    name: string;
    value: {
        type: string;
        fields: {
            quote_amount: string;
            shares: string;
            timestamp_ms: string;
        };
    };
}

export interface RewardStruct {
    id: {
        id: string;
    };
    name: string;
    value: {
        type: string;
        fields: {
            claimable_reward: string;
            previous_reward_per_share: string;
        };
    };
}

export interface TradeSettingsStruct {
    min_keeper_reward: string;
    max_keeper_reward: string;
    min_initial_margin: string;
    initial_margin_ratio: string;
    min_initial_margin_ratio: string;
    maintenance_margin_scalar: string;
    liquidation_limit_scalar: string;
    liquidation_window_duration_secs: string;
    max_liquidation_pd: string;
    flag_reward_ratio: string;
    taker_fee: string;
    maker_fee: string;
    protocol_trade_fee: string;
    max_market_size: string;
    max_funding_velocity: string;
    skew_scale: string;
    stale_price_threshold_secs: string;
    ready_order_threshold_secs: string;
    stale_order_threshold_secs: string;
    can_increase_size: boolean;
    can_decrease_size: boolean;
    can_withdraw_margin: boolean;
    can_deposit_margin: boolean;
    low_utilization_interest_rate_gradient: string;
    interest_rate_gradient_breakpoint: string;
    high_utilization_interest_rate_gradient: string;
}

export interface StakeSettingsStruct {
    can_stake: boolean;
    can_unstake: boolean;
    utilization_multiplier: string;
    max_capacity: string;
    stake_locked_seconds: string;
    stake_unstake_fee: string;
    min_stake_coin_amt: string;
}

export interface VaultStruct {
    funds: string;
    protocol_funds: string;
}

export interface I64Struct {
    value: string;
    direction: boolean;
}

export interface TableStruct {
    id: { id: string };
    size: string;
}

export interface BagStruct {
    id: { id: string };
    size: string;
}

export interface BigVectorStruct {
    id: { id: string };
    length: string;
    slice_idx: string;
    slice_size: number;
}
