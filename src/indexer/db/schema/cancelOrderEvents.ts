import {
    eventSchema,
    IEvent,
    MONGO_REQUIRED_STRING,
    TIMESTAMPS,
} from "@src/indexer/db/dbConstants";
import mongoose, { Schema, model, FilterQuery, Model } from "mongoose";

export const CANCEL_ORDER_EVENTS_COLLECTION = "cancel-order-events";

export interface ICancelOrderEvent extends IEvent {
    account: string;
    sizeDelta: string;
    sizeDeltaDirection: string;
    limitPrice: string;
    margin: string;
    createdTime: string;
}

let eventsModel: Model<ICancelOrderEvent, {}, {}, {}, any>;
if (process.env.MONGODB_NAME) {
    // mongo schema
    const eventsSchema = new Schema<ICancelOrderEvent>({
        ...eventSchema,
        account: MONGO_REQUIRED_STRING,
        sizeDelta: MONGO_REQUIRED_STRING,
        sizeDeltaDirection: MONGO_REQUIRED_STRING,
        limitPrice: MONGO_REQUIRED_STRING,
        margin: MONGO_REQUIRED_STRING,
        createdTime: MONGO_REQUIRED_STRING,
    });

    eventsSchema.set(TIMESTAMPS, true);
    eventsSchema.index({ account: 1 });

    // Due to a nextJS issue with mongo, we need to first check and return the model if it has already been created
    // see https://stackoverflow.com/questions/62440264/mongoose-nextjs-model-is-not-defined-cannot-overwrite-model-once-compiled for more details
    eventsModel =
        (mongoose.models[CANCEL_ORDER_EVENTS_COLLECTION] as mongoose.Model<
            ICancelOrderEvent,
            {},
            {},
            {},
            any
        >) ||
        model<ICancelOrderEvent>(CANCEL_ORDER_EVENTS_COLLECTION, eventsSchema);
}

export async function findCancelOrderEventsByQuery(
    query: FilterQuery<ICancelOrderEvent>
): Promise<ICancelOrderEvent[]> {
    verifyModel();
    return await eventsModel.find(query);
}

export async function insertCancelOrderEvent(event: ICancelOrderEvent) {
    verifyModel();
    return await eventsModel.create(event);
}

function verifyModel() {
    if (!eventsModel) {
        throw new Error("DB connection not initialized");
    }
}
