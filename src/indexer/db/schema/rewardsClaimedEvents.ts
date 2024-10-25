import {
    eventSchema,
    IEvent,
    MONGO_REQUIRED_STRING,
    TIMESTAMPS,
} from "@src/indexer/db/dbConstants";
import mongoose, { Schema, model, FilterQuery, Model } from "mongoose";

export const REWARDS_CLAIMED_EVENTS_COLLECTION = "rewards-claimed-events";

export interface IRewardsClaimedEvent extends IEvent {
    account: string;
    reward: string;
}

let eventsModel: Model<IRewardsClaimedEvent, {}, {}, {}, any>;
if (process.env.MONGODB_NAME) {
    // mongo schema
    const eventsSchema = new Schema<IRewardsClaimedEvent>({
        ...eventSchema,
        account: MONGO_REQUIRED_STRING,
        reward: MONGO_REQUIRED_STRING,
    });

    eventsSchema.set(TIMESTAMPS, true);
    eventsSchema.index({ account: 1 });

    // Due to a nextJS issue with mongo, we need to first check and return the model if it has already been created
    // see https://stackoverflow.com/questions/62440264/mongoose-nextjs-model-is-not-defined-cannot-overwrite-model-once-compiled for more details
    eventsModel =
        (mongoose.models[REWARDS_CLAIMED_EVENTS_COLLECTION] as mongoose.Model<
            IRewardsClaimedEvent,
            {},
            {},
            {},
            any
        >) ||
        model<IRewardsClaimedEvent>(
            REWARDS_CLAIMED_EVENTS_COLLECTION,
            eventsSchema
        );
}

export async function findRewardsClaimedEventsByQuery(
    query: FilterQuery<IRewardsClaimedEvent>
): Promise<IRewardsClaimedEvent[]> {
    verifyModel();
    return await eventsModel.find(query);
}

export async function insertRewardsClaimedEvent(event: IRewardsClaimedEvent) {
    verifyModel();
    return await eventsModel.create(event);
}

function verifyModel() {
    if (!eventsModel) {
        throw new Error("DB connection not initialized");
    }
}
