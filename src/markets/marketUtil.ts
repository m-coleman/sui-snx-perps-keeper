import {
    CalculatedValues,
    I64,
    Market,
    Oracle,
    StakeSettings,
    StakeState,
    SUPPORTED_MARKETS,
    TradeSettings,
    TradeState,
    Vault,
} from "@src/markets/markets";

export function isSupportedMarket(baseAssetName: string): boolean {
    return SUPPORTED_MARKETS.some(
        (market) => market.baseAsset.name === baseAssetName
    );
}

export function getMarket(pairName: string): Market | undefined {
    return SUPPORTED_MARKETS.find(
        (market) => getMarketName(market) === pairName
    );
}

export function getMarketName(market: Market) {
    return `${market.baseAsset.name}-${market.quoteAsset.name}`;
}

export function getMarketSuiTypes(market: Market): string[] {
    return [market.baseAsset.suiType, market.quoteAsset.suiType];
}

export function getQuoteAssetCoinType(market: Market): string {
    return `0x2::coin::Coin<${market.quoteAsset.suiType}>`;
}

export function getOneUnit(market: Market): number {
    return 10 ** market.decimals;
}

export function getDefaultOracle(): Oracle {
    const defaultOracle: Oracle = {
        price: 0,
        timestamp: new Date(0),
        pythPriceInfoObjectId: "",
    };
    return defaultOracle;
}

export function getDefaultTradeState(): TradeState {
    return {
        size: 0,
        skew: newI64(),
        entryDebtCorrection: newI64(),
        fundingLastRecomputed: 0, // timestamp
        latestFunding: newI64(),
        latestFundingRate: newI64(),
        interestRateData: {
            lifetimeInterestAccruedPct: 0,
            timestamp: 0,
            weightedOutstandingInterestPct: 0,
        },
        liquidationWindowData: [],
        ordersTableId: "",
        positionsTableId: "",
    };
}

export function getDefaultStakeState(): StakeState {
    return {
        totalShares: 0,
        cumulativeRewardPerShare: 0,
        feesOutstanding: 0,
        stakesTableId: "",
        rewardsTableId: "",
    };
}

export function getDefaultTradeSettings(): TradeSettings {
    return {
        minKeeperReward: 0,
        maxKeeperReward: 0,
        minInitialMargin: 0,
        initialMarginRatio: 0,
        minInitialMarginRatio: 0,
        maintenanceMarginScalar: 0,
        liquidationLimitScalar: 0,
        liquidationWindowDurationSecs: 0,
        maxLiquidationPd: 0,
        flagRewardRatio: 0,
        takerFee: 0,
        makerFee: 0,
        protocolTradeFee: 0,
        maxMarketSize: 0,
        maxFundingVelocity: 0,
        skewScale: 0,
        stalePriceThresholdSecs: 0,
        readyOrderThresholdSecs: 0,
        staleOrderThresholdSecs: 0,
        canIncreaseSize: false,
        canDecreaseSize: false,
        canWithdrawMargin: false,
        canDepositMargin: false,
        lowUtilizationInterestRateGradient: 0,
        interestRateGradientBreakpoint: 0,
        highUtilizationInterestRateGradient: 0,
    };
}

export function getDefaultStakeSettings(): StakeSettings {
    return {
        canStake: false,
        canUnstake: false,
        utilizationMultiplier: 0,
        maxCapacity: 0,
        stakeLockedSeconds: 0,
        stakeUnstakeFee: 0,
        minStakeCoinAmt: 0,
    };
}

export function getDefaultVault(): Vault {
    return {
        funds: 0,
        protocolFunds: 0,
    };
}

export function getDefaultCalculatedValues(): CalculatedValues {
    return {
        sizeLong: 0,
        sizeShort: 0,
        marketDebt: 0,
        unrecordedFunding: newI64(),
        nextFundingEntry: newI64(),
        fundingRate: newI64(),
        fundingVelocity: newI64(),
        interestRate: 0,
        currLiqCapacity: 0,
        lastLiqTimestamp: 0,
        maxLiqAmountInWindow: 0,
        vaultNetBalance: 0,
    };
}

export function newI64(): I64 {
    return {
        value: 0,
        direction: false,
    };
}
