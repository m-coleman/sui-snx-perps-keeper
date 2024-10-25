import { EventId, SuiEvent, SuiEventFilter } from "@mysten/sui/dist/cjs/client";
import { establishMongoDBConnection } from "@src/indexer/db/db";
import {
    findOneCursorByQuery,
    upsertCursor,
} from "@src/indexer/db/schema/cursors";
import {
    handleCancelOrderEvent,
    handleGlobalMarketsEnabledUpdatedEvent,
    handleGlobalMarketsVersionMigratedEvent,
    handleMarketAddedEvent,
    handleMarketParamUpdatedEvent,
    handleModifyPositionEvent,
    handleOrderExecutedEvent,
    handlePositionLiquidatedEvent,
    handleProtocolFundsWithdrawnEvent,
    handleRewardsClaimedEvent,
    handleStakeEvent,
    handleUnstakeEvent,
    handleWithdrawMarginEvent,
} from "@src/indexer/eventHandlers";
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
    logInfo(null, `Processing ${type} event`);
    switch (type) {
        case "StakeEvent":
            await handleStakeEvent(event);
            break;
        case "UnstakeEvent":
            await handleUnstakeEvent(event);
            break;
        case "RewardsClaimedEvent":
            await handleRewardsClaimedEvent(event);
            break;
        case "ModifyPositionEvent":
            await handleModifyPositionEvent(event);
            break;
        case "WithdrawMarginEvent":
            await handleWithdrawMarginEvent(event);
            break;
        case "CancelOrderEvent":
            await handleCancelOrderEvent(event);
            break;
        case "PositionLiquidatedEvent":
            await handlePositionLiquidatedEvent(event);
            break;
        case "OrderExecutedEvent":
            await handleOrderExecutedEvent(event);
            break;
        case "MarketAdded":
            await handleMarketAddedEvent(event);
            break;
        case "MarketParamUpdatedU64":
        case "MarketParamUpdatedID":
        case "MarketParamUpdatedBool":
            await handleMarketParamUpdatedEvent(event);
            break;
        case "ProtocolFundsWithdrawn":
            await handleProtocolFundsWithdrawnEvent(event);
            break;
        case "GlobalMarketsEnabledUpdated":
            await handleGlobalMarketsEnabledUpdatedEvent(event);
            break;
        case "GlobalMarketsVersionMigrated":
            await handleGlobalMarketsVersionMigratedEvent(event);
            break;
        default:
            logError(null, `Unknown event type: ${type}`);
            return;
    }
    logInfo(null, `Finished processing ${type} event`);
}

// Extracts a type from the entire type string like:
// 0x9e4e96d1dd8563da9cabc6a1a19287293cd3d21edfc636aa4622d43075b4b2e0::events::MarketParamUpdatedU64<0x018751cce488109992a68ccba3781590c01c54f089d5765e87434f109a713aa0::base_assets::BTC, 0x32acb908c1237d85ccf612e4eca2eb030fe70ff86a6b367bb7566a746ea9ae4a::usdc6::USDC6>
// returns MarketParamUpdatedU64
function getType(typeString: string) {
    return typeString.split("::")[2].split("<")[0];
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
