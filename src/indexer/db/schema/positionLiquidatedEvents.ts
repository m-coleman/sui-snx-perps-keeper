import {
    eventSchema,
    IEvent,
    MONGO_REQUIRED_STRING,
    TIMESTAMPS,
} from "@src/indexer/db/dbConstants";
import mongoose, { Schema, model, FilterQuery, Model } from "mongoose";

export const POSITION_LIQUIDATED_EVENTS_COLLECTION =
    "position-liquidated-events";

export interface IPositionLiquidatedEvent extends IEvent {
    account: string;
    amountLiquidated: string;
    liquidator: string;
    keeperReward: string;
}

let eventsModel: Model<IPositionLiquidatedEvent, {}, {}, {}, any>;
if (process.env.MONGODB_NAME) {
    // mongo schema
    const eventsSchema = new Schema<IPositionLiquidatedEvent>({
        ...eventSchema,
        account: MONGO_REQUIRED_STRING,
        amountLiquidated: MONGO_REQUIRED_STRING,
        liquidator: MONGO_REQUIRED_STRING,
        keeperReward: MONGO_REQUIRED_STRING,
    });

    eventsSchema.set(TIMESTAMPS, true);
    eventsSchema.index({ account: 1 });

    // Due to a nextJS issue with mongo, we need to first check and return the model if it has already been created
    // see https://stackoverflow.com/questions/62440264/mongoose-nextjs-model-is-not-defined-cannot-overwrite-model-once-compiled for more details
    eventsModel =
        (mongoose.models[
            POSITION_LIQUIDATED_EVENTS_COLLECTION
        ] as mongoose.Model<IPositionLiquidatedEvent, {}, {}, {}, any>) ||
        model<IPositionLiquidatedEvent>(
            POSITION_LIQUIDATED_EVENTS_COLLECTION,
            eventsSchema
        );
}

export async function findPositionLiquidatedEventsByQuery(
    query: FilterQuery<IPositionLiquidatedEvent>
): Promise<IPositionLiquidatedEvent[]> {
    verifyModel();
    return await eventsModel.find(query);
}

export async function insertPositionLiquidatedEvent(
    event: IPositionLiquidatedEvent
) {
    verifyModel();
    return await eventsModel.create(event);
}

function verifyModel() {
    if (!eventsModel) {
        throw new Error("DB connection not initialized");
    }
}
