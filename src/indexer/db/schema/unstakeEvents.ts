import {
    eventSchema,
    IEvent,
    MONGO_REQUIRED_STRING,
    TIMESTAMPS,
} from "@src/indexer/db/dbConstants";
import mongoose, { Schema, model, FilterQuery, Model } from "mongoose";

export const UNSTAKE_EVENTS_COLLECTION = "unstake-events";

export interface IUnstakeEvent extends IEvent {
    account: string;
    shares: string;
    amount: string;
    isFullRedeem: string;
}

let unstakeEventsModel: Model<IUnstakeEvent, {}, {}, {}, any>;
if (process.env.MONGODB_NAME) {
    // mongo schema
    const unstakeEventsSchema = new Schema<IUnstakeEvent>({
        ...eventSchema,
        account: MONGO_REQUIRED_STRING,
        shares: MONGO_REQUIRED_STRING,
        amount: MONGO_REQUIRED_STRING,
        isFullRedeem: MONGO_REQUIRED_STRING,
    });

    unstakeEventsSchema.set(TIMESTAMPS, true);
    unstakeEventsSchema.index({ account: 1 });

    // Due to a nextJS issue with mongo, we need to first check and return the model if it has already been created
    // see https://stackoverflow.com/questions/62440264/mongoose-nextjs-model-is-not-defined-cannot-overwrite-model-once-compiled for more details
    unstakeEventsModel =
        (mongoose.models[UNSTAKE_EVENTS_COLLECTION] as mongoose.Model<
            IUnstakeEvent,
            {},
            {},
            {},
            any
        >) ||
        model<IUnstakeEvent>(UNSTAKE_EVENTS_COLLECTION, unstakeEventsSchema);
}

export async function findUnstakeEventsByQuery(
    query: FilterQuery<IUnstakeEvent>
): Promise<IUnstakeEvent[]> {
    verifyModel();
    return await unstakeEventsModel.find(query);
}

export async function insertUnstakeEvent(event: IUnstakeEvent) {
    verifyModel();
    return await unstakeEventsModel.create(event);
}

function verifyModel() {
    if (!unstakeEventsModel) {
        throw new Error("DB connection not initialized");
    }
}
