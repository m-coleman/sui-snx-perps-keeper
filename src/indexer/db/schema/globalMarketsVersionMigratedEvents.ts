import {
    eventSchema,
    IEvent,
    MONGO_REQUIRED_STRING,
    TIMESTAMPS,
} from "@src/indexer/db/dbConstants";
import mongoose, { Schema, model, FilterQuery, Model } from "mongoose";

export const GLOBAL_MARKETS_VERSION_MIGRATED_EVENTS_COLLECTION =
    "global-markets-version-migrated-events";

export interface IGlobalMarketsVersionMigratedEvent extends IEvent {
    prevVersion: string;
    newVersion: string;
}

let eventsModel: Model<IGlobalMarketsVersionMigratedEvent, {}, {}, {}, any>;
if (process.env.MONGODB_NAME) {
    // mongo schema
    const eventsSchema = new Schema<IGlobalMarketsVersionMigratedEvent>({
        ...eventSchema,
        prevVersion: MONGO_REQUIRED_STRING,
        newVersion: MONGO_REQUIRED_STRING,
    });

    eventsSchema.set(TIMESTAMPS, true);

    // Due to a nextJS issue with mongo, we need to first check and return the model if it has already been created
    // see https://stackoverflow.com/questions/62440264/mongoose-nextjs-model-is-not-defined-cannot-overwrite-model-once-compiled for more details
    eventsModel =
        (mongoose.models[
            GLOBAL_MARKETS_VERSION_MIGRATED_EVENTS_COLLECTION
        ] as mongoose.Model<
            IGlobalMarketsVersionMigratedEvent,
            {},
            {},
            {},
            any
        >) ||
        model<IGlobalMarketsVersionMigratedEvent>(
            GLOBAL_MARKETS_VERSION_MIGRATED_EVENTS_COLLECTION,
            eventsSchema
        );
}

export async function findGlobalMarketsVersionMigratedEventsByQuery(
    query: FilterQuery<IGlobalMarketsVersionMigratedEvent>
): Promise<IGlobalMarketsVersionMigratedEvent[]> {
    verifyModel();
    return await eventsModel.find(query);
}

export async function insertGlobalMarketsVersionMigratedEvent(
    event: IGlobalMarketsVersionMigratedEvent
) {
    verifyModel();
    return await eventsModel.create(event);
}

function verifyModel() {
    if (!eventsModel) {
        throw new Error("DB connection not initialized");
    }
}
