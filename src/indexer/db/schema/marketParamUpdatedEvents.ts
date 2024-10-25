import {
    eventSchema,
    IEvent,
    MONGO_REQUIRED_STRING,
    TIMESTAMPS,
} from "@src/indexer/db/dbConstants";
import mongoose, { Schema, model, FilterQuery, Model } from "mongoose";

export const MARKET_PARAM_UPDATED_EVENTS_COLLECTION =
    "market-param-updated-events";

export interface IMarketParamUpdatedEvent extends IEvent {
    paramName: string;
    paramValue: string;
}

let eventsModel: Model<IMarketParamUpdatedEvent, {}, {}, {}, any>;
if (process.env.MONGODB_NAME) {
    // mongo schema
    const eventsSchema = new Schema<IMarketParamUpdatedEvent>({
        ...eventSchema,
        paramName: MONGO_REQUIRED_STRING,
        paramValue: MONGO_REQUIRED_STRING,
    });

    eventsSchema.set(TIMESTAMPS, true);

    // Due to a nextJS issue with mongo, we need to first check and return the model if it has already been created
    // see https://stackoverflow.com/questions/62440264/mongoose-nextjs-model-is-not-defined-cannot-overwrite-model-once-compiled for more details
    eventsModel =
        (mongoose.models[
            MARKET_PARAM_UPDATED_EVENTS_COLLECTION
        ] as mongoose.Model<IMarketParamUpdatedEvent, {}, {}, {}, any>) ||
        model<IMarketParamUpdatedEvent>(
            MARKET_PARAM_UPDATED_EVENTS_COLLECTION,
            eventsSchema
        );
}

export async function findMarketParamUpdatedEventsByQuery(
    query: FilterQuery<IMarketParamUpdatedEvent>
): Promise<IMarketParamUpdatedEvent[]> {
    verifyModel();
    return await eventsModel.find(query);
}

export async function insertMarketParamUpdatedEvent(
    event: IMarketParamUpdatedEvent
) {
    verifyModel();
    return await eventsModel.create(event);
}

function verifyModel() {
    if (!eventsModel) {
        throw new Error("DB connection not initialized");
    }
}
