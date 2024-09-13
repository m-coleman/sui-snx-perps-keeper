import {
    getDefaultCalculatedValues,
    getDefaultOracle,
    getDefaultStakeSettings,
    getDefaultStakeState,
    getDefaultTradeSettings,
    getDefaultTradeState,
    getDefaultVault,
} from "@src/markets/marketUtil";
import {
    getSynthsPackageId,
    getUsdcPackageId,
} from "@src/util/environmentUtil";

export interface GlobalMarkets {
    id: string;
    // marketIds: string[];
    globalMarketsEnabled: boolean;
    version: number;
    adminCapId: string;
}

export interface Market {
    id: string;
    baseAsset: BaseAsset;
    quoteAsset: QuoteAsset;
    decimals: number;
    pythSymbol: string; // BTCUSDC, ETHUSDC, etc
    exists: boolean;
    oracle: Oracle;
    tradeState: TradeState;
    stakeState: StakeState;
    tradeSettings: TradeSettings;
    stakeSettings: StakeSettings;
    vault: Vault;
    calculatedValues: CalculatedValues;
    isLoaded: boolean;
}

export interface TradeState {
    size: number;
    skew: I64;
    entryDebtCorrection: I64;
    fundingLastRecomputed: number; // timestamp
    latestFunding: I64;
    latestFundingRate: I64;
    interestRateData: InterestRateData;
    liquidationWindowData: LiquidationData[];
    ordersTableId: string;
    positionsTableId: string;
}

export interface StakeState {
    totalShares: number;
    cumulativeRewardPerShare: number;
    feesOutstanding: number;
    stakesTableId: string;
    rewardsTableId: string;
}

export interface Stake {
    quoteAmount: number;
    shares: number;
    timestamp: number;
}

export interface Reward {
    claimableReward: number;
    previousRewardPerShare: number;
}

export interface TradeSettings {
    minKeeperReward: number;
    maxKeeperReward: number;
    minInitialMargin: number;
    initialMarginRatio: number;
    minInitialMarginRatio: number;
    maintenanceMarginScalar: number;
    liquidationLimitScalar: number;
    liquidationWindowDurationSecs: number;
    maxLiquidationPd: number;
    flagRewardRatio: number;
    takerFee: number;
    makerFee: number;
    protocolTradeFee: number;
    maxMarketSize: number;
    maxFundingVelocity: number;
    skewScale: number;
    stalePriceThresholdSecs: number;
    readyOrderThresholdSecs: number;
    staleOrderThresholdSecs: number;
    canIncreaseSize: boolean;
    canDecreaseSize: boolean;
    canWithdrawMargin: boolean;
    canDepositMargin: boolean;
    lowUtilizationInterestRateGradient: number;
    interestRateGradientBreakpoint: number;
    highUtilizationInterestRateGradient: number;
}

export interface StakeSettings {
    canStake: boolean;
    canUnstake: boolean;
    utilizationMultiplier: number;
    maxCapacity: number;
    stakeLockedSeconds: number;
    stakeUnstakeFee: number;
    minStakeCoinAmt: number;
}

export interface Vault {
    funds: number;
    protocolFunds: number;
}

export interface CalculatedValues {
    sizeLong: number;
    sizeShort: number;
    marketDebt: number;
    unrecordedFunding: I64;
    nextFundingEntry: I64;
    fundingRate: I64;
    fundingVelocity: I64;
    interestRate: number;
    currLiqCapacity: number;
    lastLiqTimestamp: number;
    maxLiqAmountInWindow: number;
    vaultNetBalance: number;
}

export interface InterestRateData {
    lifetimeInterestAccruedPct: number;
    timestamp: number;
    weightedOutstandingInterestPct: number;
}

export interface LiquidationData {
    amount: number;
    timestamp: number;
}

export interface I64 {
    value: number;
    direction: boolean;
}

export interface BaseAsset {
    name: string; // ETH, BTC, etc
    fullname: string; // Ethereum, Bitcoin, etc
    suiType: string; // <packageId>::synths::<name>
    pythPriceFeedId: string; // see: https://pyth.network/developers/price-feed-ids#sui-testnet
}

export interface QuoteAsset {
    name: string; // ETH, BTC, etc
    fullname: string; // Ethereum, Bitcoin, etc
    suiType: string; // <packageId>::synths::<name>
}

export interface Oracle {
    price: number;
    timestamp: Date;
    pythPriceInfoObjectId: string;
}

export interface Order {
    sizeDelta: number;
    sizeDeltaDirection: boolean;
    limitPrice: number;
    timestamp: number;
    margin: number;
}

// should only be used when fetching data from the contract
export interface PositionStructFormatted {
    // from position struct
    funding: number;
    fundingDirection: boolean;
    margin: number;
    lastPrice: number;
    size: number;
    direction: boolean;
    latestInterestAccruedPct: number;
    isFlagged: boolean;
}

export interface Position extends PositionStructFormatted {
    // calculated values
    leverage: number;
    remainingMargin: number;
    accessibleMargin: number;
    pnl: number;
    pnlDirection: boolean;
    accruedFunding: number;
    accruedFundingDirection: boolean;
    liquidationPrice: number;
    canLiquidate: boolean;
    interestCharged: number; // interest charged
    initialMargin: number;
    maintenanceMargin: number;
    liquidationReward: number;
    flagReward: number;
    healthFactor: number;
    numLiqWindows: number;
}

export const USDC_ASSET: QuoteAsset = {
    name: "USDC",
    fullname: "USD Coin",
    suiType: `${getUsdcPackageId()}::usdc6::USDC6`,
};

export const ETH_ASSET: BaseAsset = {
    name: "ETH",
    fullname: "Ethereum",
    suiType: `${getSynthsPackageId()}::base_assets::ETH`,
    pythPriceFeedId:
        "0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6",
};

export const BTC_ASSET: BaseAsset = {
    name: "BTC",
    fullname: "Bitcoin",
    suiType: `${getSynthsPackageId()}::base_assets::BTC`,
    pythPriceFeedId:
        "0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b",
};

export const DOGE_ASSET: BaseAsset = {
    name: "DOGE",
    fullname: "Dogecoin",
    suiType: `${getSynthsPackageId()}::base_assets::DOGE`,
    pythPriceFeedId:
        "0x31775e1d6897129e8a84eeba975778fb50015b88039e9bc140bbd839694ac0ae",
};

export const ETH_USDC_MARKET: Market = {
    id: "", // will be loaded on-demand
    baseAsset: ETH_ASSET,
    quoteAsset: USDC_ASSET,
    decimals: 0,
    pythSymbol: "ETHUSD",
    exists: false,
    oracle: getDefaultOracle(),
    tradeState: getDefaultTradeState(),
    stakeState: getDefaultStakeState(),
    tradeSettings: getDefaultTradeSettings(),
    stakeSettings: getDefaultStakeSettings(),
    vault: getDefaultVault(),
    calculatedValues: getDefaultCalculatedValues(),
    isLoaded: true,
};

export const BTC_USDC_MARKET: Market = {
    id: "", // will be loaded on-demand
    baseAsset: BTC_ASSET,
    quoteAsset: USDC_ASSET,
    decimals: 0,
    pythSymbol: "BTCUSD",
    exists: false,
    oracle: getDefaultOracle(),
    tradeState: getDefaultTradeState(),
    stakeState: getDefaultStakeState(),
    tradeSettings: getDefaultTradeSettings(),
    stakeSettings: getDefaultStakeSettings(),
    vault: getDefaultVault(),
    calculatedValues: getDefaultCalculatedValues(),
    isLoaded: true,
};

export const DOGE_USDC_MARKET: Market = {
    id: "", // will be loaded on-demand
    baseAsset: DOGE_ASSET,
    quoteAsset: USDC_ASSET,
    decimals: 0,
    pythSymbol: "DOGEUSD",
    exists: false,
    oracle: getDefaultOracle(),
    tradeState: getDefaultTradeState(),
    stakeState: getDefaultStakeState(),
    tradeSettings: getDefaultTradeSettings(),
    stakeSettings: getDefaultStakeSettings(),
    vault: getDefaultVault(),
    calculatedValues: getDefaultCalculatedValues(),
    isLoaded: true,
};

export const SUPPORTED_MARKETS: Market[] = [
    BTC_USDC_MARKET,
    ETH_USDC_MARKET,
    DOGE_USDC_MARKET,
];

export const SUPPORTED_ASSET_NAMES: string[] = [
    USDC_ASSET,
    BTC_ASSET,
    ETH_ASSET,
].map((asset) => asset.name);
