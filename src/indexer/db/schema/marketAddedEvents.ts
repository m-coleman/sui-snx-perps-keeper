import {
    eventSchema,
    IEvent,
    MONGO_REQUIRED_STRING,
    TIMESTAMPS,
} from "@src/indexer/db/dbConstants";
import mongoose, { Schema, model, FilterQuery, Model } from "mongoose";

export const MARKET_ADDED_EVENTS_COLLECTION = "market-added-events";

export interface IMarketAddedEvent extends IEvent {
    marketName: string;
    marketId: string;
}

let eventsModel: Model<IMarketAddedEvent, {}, {}, {}, any>;
if (process.env.MONGODB_NAME) {
    // mongo schema
    const eventsSchema = new Schema<IMarketAddedEvent>({
        ...eventSchema,
        marketName: MONGO_REQUIRED_STRING,
        marketId: MONGO_REQUIRED_STRING,
    });

    eventsSchema.set(TIMESTAMPS, true);

    // Due to a nextJS issue with mongo, we need to first check and return the model if it has already been created
    // see https://stackoverflow.com/questions/62440264/mongoose-nextjs-model-is-not-defined-cannot-overwrite-model-once-compiled for more details
    eventsModel =
        (mongoose.models[MARKET_ADDED_EVENTS_COLLECTION] as mongoose.Model<
            IMarketAddedEvent,
            {},
            {},
            {},
            any
        >) ||
        model<IMarketAddedEvent>(MARKET_ADDED_EVENTS_COLLECTION, eventsSchema);
}

export async function findMarketAddedEventsByQuery(
    query: FilterQuery<IMarketAddedEvent>
): Promise<IMarketAddedEvent[]> {
    verifyModel();
    return await eventsModel.find(query);
}

export async function insertMarketAddedEvent(event: IMarketAddedEvent) {
    verifyModel();
    return await eventsModel.create(event);
}

function verifyModel() {
    if (!eventsModel) {
        throw new Error("DB connection not initialized");
    }
}
