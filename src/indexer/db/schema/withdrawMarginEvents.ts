import {
    eventSchema,
    IEvent,
    MONGO_REQUIRED_STRING,
    TIMESTAMPS,
} from "@src/indexer/db/dbConstants";
import mongoose, { Schema, model, FilterQuery, Model } from "mongoose";

export const WITHDRAW_MARGIN_EVENTS_COLLECTION = "withdraw-margin-events";

export interface IWithdrawMarginEvent extends IEvent {
    account: string;
    margin: string;
}

let eventsModel: Model<IWithdrawMarginEvent, {}, {}, {}, any>;
if (process.env.MONGODB_NAME) {
    // mongo schema
    const eventsSchema = new Schema<IWithdrawMarginEvent>({
        ...eventSchema,
        account: MONGO_REQUIRED_STRING,
        margin: MONGO_REQUIRED_STRING,
    });

    eventsSchema.set(TIMESTAMPS, true);
    eventsSchema.index({ account: 1 });

    // Due to a nextJS issue with mongo, we need to first check and return the model if it has already been created
    // see https://stackoverflow.com/questions/62440264/mongoose-nextjs-model-is-not-defined-cannot-overwrite-model-once-compiled for more details
    eventsModel =
        (mongoose.models[WITHDRAW_MARGIN_EVENTS_COLLECTION] as mongoose.Model<
            IWithdrawMarginEvent,
            {},
            {},
            {},
            any
        >) ||
        model<IWithdrawMarginEvent>(
            WITHDRAW_MARGIN_EVENTS_COLLECTION,
            eventsSchema
        );
}

export async function findWithdrawMarginEventsByQuery(
    query: FilterQuery<IWithdrawMarginEvent>
): Promise<IWithdrawMarginEvent[]> {
    verifyModel();
    return await eventsModel.find(query);
}

export async function insertWithdrawMarginEvent(event: IWithdrawMarginEvent) {
    verifyModel();
    return await eventsModel.create(event);
}

function verifyModel() {
    if (!eventsModel) {
        throw new Error("DB connection not initialized");
    }
}
