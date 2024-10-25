import {
    eventSchema,
    IEvent,
    MONGO_REQUIRED_STRING,
    TIMESTAMPS,
} from "@src/indexer/db/dbConstants";
import mongoose, { Schema, model, FilterQuery, Model } from "mongoose";

export const GLOBAL_MARKETS_ENBALED_UPDATED_EVENTS_COLLECTION =
    "global-markets-enabled-updated-events";

export interface IGlobalMarketsEnbaledUpdatedEvent extends IEvent {
    val: string;
}

let eventsModel: Model<IGlobalMarketsEnbaledUpdatedEvent, {}, {}, {}, any>;
if (process.env.MONGODB_NAME) {
    // mongo schema
    const eventsSchema = new Schema<IGlobalMarketsEnbaledUpdatedEvent>({
        ...eventSchema,
        val: MONGO_REQUIRED_STRING,
    });

    eventsSchema.set(TIMESTAMPS, true);

    // Due to a nextJS issue with mongo, we need to first check and return the model if it has already been created
    // see https://stackoverflow.com/questions/62440264/mongoose-nextjs-model-is-not-defined-cannot-overwrite-model-once-compiled for more details
    eventsModel =
        (mongoose.models[
            GLOBAL_MARKETS_ENBALED_UPDATED_EVENTS_COLLECTION
        ] as mongoose.Model<
            IGlobalMarketsEnbaledUpdatedEvent,
            {},
            {},
            {},
            any
        >) ||
        model<IGlobalMarketsEnbaledUpdatedEvent>(
            GLOBAL_MARKETS_ENBALED_UPDATED_EVENTS_COLLECTION,
            eventsSchema
        );
}

export async function findGlobalMarketsEnabledUpdatedEventsByQuery(
    query: FilterQuery<IGlobalMarketsEnbaledUpdatedEvent>
): Promise<IGlobalMarketsEnbaledUpdatedEvent[]> {
    verifyModel();
    return await eventsModel.find(query);
}

export async function insertGlobalMarketsEnabledUpdatedEvent(
    event: IGlobalMarketsEnbaledUpdatedEvent
) {
    verifyModel();
    return await eventsModel.create(event);
}

function verifyModel() {
    if (!eventsModel) {
        throw new Error("DB connection not initialized");
    }
}
