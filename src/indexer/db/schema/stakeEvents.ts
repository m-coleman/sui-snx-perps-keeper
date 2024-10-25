import {
    eventSchema,
    IEvent,
    MONGO_REQUIRED_STRING,
    TIMESTAMPS,
} from "@src/indexer/db/dbConstants";
import mongoose, { Schema, model, FilterQuery, Model } from "mongoose";

export const STAKE_EVENTS_COLLECTION = "stake-events";

export interface IStakeEvent extends IEvent {
    account: string;
    shares: string;
    amount: string;
    isReinvest: string;
}

let stakeEventsModel: Model<IStakeEvent, {}, {}, {}, any>;
if (process.env.MONGODB_NAME) {
    // mongo schema
    const stakeEventsSchema = new Schema<IStakeEvent>({
        ...eventSchema,
        account: MONGO_REQUIRED_STRING,
        shares: MONGO_REQUIRED_STRING,
        amount: MONGO_REQUIRED_STRING,
        isReinvest: MONGO_REQUIRED_STRING,
    });

    stakeEventsSchema.set(TIMESTAMPS, true);
    stakeEventsSchema.index({ account: 1 });

    // Due to a nextJS issue with mongo, we need to first check and return the model if it has already been created
    // see https://stackoverflow.com/questions/62440264/mongoose-nextjs-model-is-not-defined-cannot-overwrite-model-once-compiled for more details
    stakeEventsModel =
        (mongoose.models[STAKE_EVENTS_COLLECTION] as mongoose.Model<
            IStakeEvent,
            {},
            {},
            {},
            any
        >) || model<IStakeEvent>(STAKE_EVENTS_COLLECTION, stakeEventsSchema);
}

export async function findStakeEventsByQuery(
    query: FilterQuery<IStakeEvent>
): Promise<IStakeEvent[]> {
    verifyModel();
    return await stakeEventsModel.find(query);
}

export async function insertStakeEvent(event: IStakeEvent) {
    verifyModel();
    return await stakeEventsModel.create(event);
}

function verifyModel() {
    if (!stakeEventsModel) {
        throw new Error("DB connection not initialized");
    }
}
