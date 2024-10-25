import {
    eventSchema,
    IEvent,
    MONGO_REQUIRED_STRING,
    TIMESTAMPS,
} from "@src/indexer/db/dbConstants";
import mongoose, { Schema, model, FilterQuery, Model } from "mongoose";

export const PROTOCOL_FUNDS_WITHDRAWN_EVENTS_COLLECTION =
    "protocol-funds-withdrawn-events";

export interface IProtocolFundsWithdrawnEvent extends IEvent {
    amount: string;
}

let eventsModel: Model<IProtocolFundsWithdrawnEvent, {}, {}, {}, any>;
if (process.env.MONGODB_NAME) {
    // mongo schema
    const eventsSchema = new Schema<IProtocolFundsWithdrawnEvent>({
        ...eventSchema,
        amount: MONGO_REQUIRED_STRING,
    });

    eventsSchema.set(TIMESTAMPS, true);

    // Due to a nextJS issue with mongo, we need to first check and return the model if it has already been created
    // see https://stackoverflow.com/questions/62440264/mongoose-nextjs-model-is-not-defined-cannot-overwrite-model-once-compiled for more details
    eventsModel =
        (mongoose.models[
            PROTOCOL_FUNDS_WITHDRAWN_EVENTS_COLLECTION
        ] as mongoose.Model<IProtocolFundsWithdrawnEvent, {}, {}, {}, any>) ||
        model<IProtocolFundsWithdrawnEvent>(
            PROTOCOL_FUNDS_WITHDRAWN_EVENTS_COLLECTION,
            eventsSchema
        );
}

export async function findProtocolFundsWithdrawnEventsByQuery(
    query: FilterQuery<IProtocolFundsWithdrawnEvent>
): Promise<IProtocolFundsWithdrawnEvent[]> {
    verifyModel();
    return await eventsModel.find(query);
}

export async function insertProtocolFundsWithdrawnEvent(
    event: IProtocolFundsWithdrawnEvent
) {
    verifyModel();
    return await eventsModel.create(event);
}

function verifyModel() {
    if (!eventsModel) {
        throw new Error("DB connection not initialized");
    }
}
