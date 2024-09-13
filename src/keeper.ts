import { TransactionBlock } from "@mysten/sui.js";
import { processLiquidations } from "@src/liquidations";
import { getMarketName } from "@src/markets/marketUtil";
import {
    BTC_USDC_MARKET,
    DOGE_USDC_MARKET,
    ETH_USDC_MARKET,
    Market,
} from "@src/markets/markets";
import { processOrders } from "@src/orders";
import { PROCESS_INTERVAL_SECONDS } from "@src/util/constants";
import { logError, logInfo } from "@src/util/logger";
import { fetchPythPriceInfoObjectId } from "@src/util/pythUtil";
import {
    devInspectTransactionBlock,
    parseTransactionResults,
} from "@src/util/suiUtil";
import { getMarketId, loadMarketObject } from "@src/util/txnBuilderReadUtil";

export async function startKeeper() {
    const markets = await initializeKeeper();
    if (!markets) {
        logError(null, "No markets to process");
        return;
    }

    logInfo(null, `Found markets: ${markets.map(getMarketName).join(", ")}`);

    for (const market of markets) {
        await runMarket(market);
    }
}

async function initializeKeeper(): Promise<Market[]> {
    const markets: Market[] = [
        BTC_USDC_MARKET,
        ETH_USDC_MARKET,
        DOGE_USDC_MARKET,
    ];

    // check if each market is registered
    const registeredMarkets: Market[] = [];
    for (const market of markets) {
        const marketId = await fetchMarketId(market);
        if (!marketId) {
            logInfo(market, "Market does not exist, ignoring it");
            continue;
        }

        market.id = marketId;
        const marketObj = await loadMarketObject(marketId);
        market.decimals = Number(marketObj.decimals);
        logInfo(
            market,
            `Market exists with ID ${marketId} and ${market.decimals} decimals`
        );

        const pythPriceInfoObjectId = await fetchPythPriceInfoObjectId(market);
        market.oracle.pythPriceInfoObjectId = pythPriceInfoObjectId;
        registeredMarkets.push(market);
    }

    return registeredMarkets;
}

async function runMarket(market: Market) {
    logInfo(market, "Running keeper");

    // Start the interval to process orders
    const runOrderInterval = async () => {
        try {
            await processOrders(market);
        } catch (e) {
            logError(market, "Keeper error during order processing", e);
        } finally {
            setTimeout(runOrderInterval, PROCESS_INTERVAL_SECONDS * 1000);
        }
    };

    const runLiquidationInterval = async () => {
        try {
            await processLiquidations(market);
        } catch (e) {
            logError(market, "Keeper error during liquidate", e);
        } finally {
            setTimeout(runLiquidationInterval, PROCESS_INTERVAL_SECONDS * 1000);
        }
    };

    runOrderInterval();
    runLiquidationInterval();
}

async function fetchMarketId(market: Market): Promise<string | null> {
    const txb = new TransactionBlock();
    const resultsTemplate: any = [];
    resultsTemplate.push(getMarketId(txb, market));
    const devInspectResults = await devInspectTransactionBlock(txb);
    parseTransactionResults(devInspectResults, resultsTemplate);
    const { id } = resultsTemplate[0];
    return id;
}
