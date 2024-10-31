import { EventId, SuiEvent, SuiEventFilter } from "@mysten/sui/dist/cjs/client";
import { establishMongoDBConnection } from "@src/indexer/db/db";
import {
    findOneCursorByQuery,
    upsertCursor,
} from "@src/indexer/db/schema/cursors";
import { IEvent, insertEvent } from "@src/indexer/db/schema/events";
import { SnxEventType } from "@src/indexer/interfaces";
import { PROVIDER } from "@src/util/constants";
import {
    getEventProcessingPollingIntervalMs,
    getPackageId,
} from "@src/util/environmentUtil";
import { logError, logInfo } from "@src/util/logger";

export const MODULES_WITH_EVENTS = [
    "market",
    "trade",
    "stake",
    "admin_settings",
];

export async function startEventIndexer() {
    try {
        await establishMongoDBConnection();
    } catch (e) {
        logError(null, e.message);
        // kill the process if we can't connect to the database
        process.exit(1);
    }

    const packageId = getPackageId();
    if (!packageId) {
        logError(null, "No package ID env var found");
        process.exit(1);
    }

    for (const module of MODULES_WITH_EVENTS) {
        const iCursor = await findOneCursorByQuery({ module });
        let cursor = iCursor
            ? { txDigest: iCursor.txDigest, eventSeq: iCursor.eventSeq }
            : null;
        const cursorStr = JSON.stringify(cursor, null, 4);
        logInfo(
            null,
            `Starting event processing job for module ${module} at cursor ${cursorStr}`
        );
        await runEventProcessingJob(packageId, module, cursor);
        // offset the start of the next module's processing job
        await sleep(1000);
    }
}

export async function runEventProcessingJob(
    packageId: string,
    module: string,
    cursor: EventId | null
) {
    let newCursor: EventId | null = cursor;
    let hasNextPage = false;
    try {
        const result = await processEvents(packageId, module, cursor);
        hasNextPage = result.hasNextPage;
        newCursor = result.cursor;
    } catch (e) {
        logError(null, `Error processing events for module ${module}`, e);
    }

    const delayMs = hasNextPage ? 0 : getEventProcessingPollingIntervalMs();
    setTimeout(() => {
        runEventProcessingJob(packageId, module, newCursor);
    }, delayMs);
}

async function processEvents(
    packageId: string,
    module: string,
    cursor: EventId | null
): Promise<{ hasNextPage: boolean; cursor: EventId | null }> {
    const eventFilter: SuiEventFilter = {
        MoveModule: {
            package: packageId,
            module,
        },
    };
    // query the events at this cursor
    const res = await PROVIDER.queryEvents({
        query: eventFilter,
        order: "ascending",
        cursor,
    });
    const events = res.data;
    for (const event of events) {
        await processEvent(event as SuiEvent);
    }

    cursor = res.nextCursor;
    // store the next cursor for this module in the db
    if (cursor) {
        await upsertCursor({ module, ...cursor });
    }

    return {
        hasNextPage: res.hasNextPage,
        cursor: cursor ? cursor : null,
    };
}

export async function processEvent(event: SuiEvent) {
    const type = getType(event.type);
    const market = getMarket(event.type, type);
    const readableMarket = getReadableMarket(market);
    const eventData = event.parsedJson;
    const eventDataStr = JSON.stringify(eventData, null, 4);
    logInfo(
        null,
        `Processing ${type} event in ${readableMarket} market: ${eventDataStr}`
    );
    const account = getAccount(type, event.sender, eventData);

    const e: IEvent = {
        txDigest: event.id.txDigest,
        eventSeq: event.id.eventSeq,
        packageId: event.packageId,
        transactionModule: event.transactionModule,
        sender: event.sender,
        type: event.type,
        timestampMs: event.timestampMs,
        readableType: type,
        rawEventData: eventData,
        account,
        baseAsset: market.baseAsset,
        quoteAsset: market.quoteAsset,
    };

    await insertEvent(e);
}

// Extracts a type from the entire type string like:
// 0x9e4e96d1dd8563da9cabc6a1a19287293cd3d21edfc636aa4622d43075b4b2e0::events::MarketParamUpdatedU64<0x018751cce488109992a68ccba3781590c01c54f089d5765e87434f109a713aa0::base_assets::BTC, 0x32acb908c1237d85ccf612e4eca2eb030fe70ff86a6b367bb7566a746ea9ae4a::usdc6::USDC6>
// returns MarketParamUpdatedU64
function getType(typeString: string): SnxEventType {
    return typeString.split("::")[2].split("<")[0] as SnxEventType;
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Extracts a market from the entire type string like:
// 0x9e4e96d1dd8563da9cabc6a1a19287293cd3d21edfc636aa4622d43075b4b2e0::events::MarketParamUpdatedU64<0x018751cce488109992a68ccba3781590c01c54f089d5765e87434f109a713aa0::base_assets::BTC, 0x32acb908c1237d85ccf612e4eca2eb030fe70ff86a6b367bb7566a746ea9ae4a::usdc6::USDC6>
// returns { baseAsset: "0x018751cce488109992a68ccba3781590c01c54f089d5765e87434f109a713aa0::base_assets::BTC", quoteAsset: "0x32acb908c1237d85ccf612e4eca2eb030fe70ff86a6b367bb7566a746ea9ae4a::usdc6::USDC6" }
// Readable type is the type without the package or module prefix
function getMarket(
    typeString: string,
    readableType: SnxEventType
): {
    baseAsset: string;
    quoteAsset: string;
} {
    const eventsWithNoMarket: SnxEventType[] = [
        "GlobalMarketsEnabledUpdated",
        "GlobalMarketsVersionMigrated",
    ];
    if (eventsWithNoMarket.includes(readableType)) {
        return { baseAsset: "N/A", quoteAsset: "N/A" };
    }

    const parts = typeString.split("<")[1].split(", ");
    return { baseAsset: parts[0], quoteAsset: parts[1].slice(0, -1) };
}

// Converts a market object into a readable string with no types, like BTC-USDC
function getReadableMarket(market: { baseAsset: string; quoteAsset: string }) {
    if (market.baseAsset === "N/A" && market.quoteAsset === "N/A") {
        return "N/A";
    }
    return `${market.baseAsset.split("::")[2]}-${
        market.quoteAsset.split("::")[2]
    }`;
}

function getAccount(
    readableType: SnxEventType,
    sender: string,
    eventData: Record<string, any>
) {
    const keeperEvents: SnxEventType[] = [
        "OrderExecutedEvent",
        "PositionLiquidatedEvent",
    ];
    if (keeperEvents.includes(readableType)) {
        return eventData.account;
    }
    return sender;
}
