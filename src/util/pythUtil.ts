import { TransactionBlock } from "@mysten/sui.js";
import {
    SuiPythClient,
    SuiPriceServiceConnection,
} from "@pythnetwork/pyth-sui-js";
import { Market } from "@src/markets/markets";
import {
    TESTNET_PROVIDER,
    UPDATE_PRICE_FEED_NUM_MOVE_CALLS,
} from "@src/util/constants";
import {
    getPythStateId,
    getPythVaasApiUrl,
    getWormholeStateId,
} from "@src/util/environmentUtil";

const priceServiceConnection = new SuiPriceServiceConnection(
    getPythVaasApiUrl()
); // See Price Service endpoints section below for other endpoints

const pythClient = new SuiPythClient(
    TESTNET_PROVIDER,
    getPythStateId(),
    getWormholeStateId()
);

/**
 * This needs to be called exactly once if the price feed hasn't been registered on Sui yet
 */
export async function createPriceFeed(txb: TransactionBlock, market: Market) {
    const buffer = await fetchPriceFeedsUpdateData(market);
    await pythClient.createPriceFeed(txb, buffer);
}

export async function fetchPythPriceInfoObjectId(
    market: Market
): Promise<string | undefined> {
    const priceFeedId = market.baseAsset.pythPriceFeedId;
    return await pythClient.getPriceFeedObjectId(priceFeedId);
}

export async function updatePriceFeed(
    tx: TransactionBlock,
    market: Market
): Promise<null[]> {
    const priceFeedId = market.baseAsset.pythPriceFeedId;
    const priceFeedUpdateData = await fetchPriceFeedsUpdateData(market);
    await pythClient.updatePriceFeeds(tx, priceFeedUpdateData, [priceFeedId]);

    // push null onto the array for each move call made by the pyth price update
    const parsingTemplate: null[] = [];
    for (let i = 0; i < UPDATE_PRICE_FEED_NUM_MOVE_CALLS; i++) {
        parsingTemplate.push(null);
    }

    return parsingTemplate;
}

async function fetchPriceFeedsUpdateData(market: Market) {
    return await priceServiceConnection.getPriceFeedsUpdateData([
        market.baseAsset.pythPriceFeedId,
    ]);
}
