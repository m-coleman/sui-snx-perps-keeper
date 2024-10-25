import {
    eventSchema,
    IEvent,
    MONGO_REQUIRED_STRING,
    TIMESTAMPS,
} from "@src/indexer/db/dbConstants";
import mongoose, { Schema, model, FilterQuery, Model } from "mongoose";

export const MODIFY_POSITION_EVENTS_COLLECTION = "modify-position-events";

export interface IModifyPositionEvent extends IEvent {
    account: string;
    sizeDelta: string;
    sizeDeltaDirection: string;
    limitPrice: string;
    margin: string;
}

let eventsModel: Model<IModifyPositionEvent, {}, {}, {}, any>;
if (process.env.MONGODB_NAME) {
    // mongo schema
    const eventsSchema = new Schema<IModifyPositionEvent>({
        ...eventSchema,
        account: MONGO_REQUIRED_STRING,
        sizeDelta: MONGO_REQUIRED_STRING,
        sizeDeltaDirection: MONGO_REQUIRED_STRING,
        limitPrice: MONGO_REQUIRED_STRING,
        margin: MONGO_REQUIRED_STRING,
    });

    eventsSchema.set(TIMESTAMPS, true);
    eventsSchema.index({ account: 1 });

    // Due to a nextJS issue with mongo, we need to first check and return the model if it has already been created
    // see https://stackoverflow.com/questions/62440264/mongoose-nextjs-model-is-not-defined-cannot-overwrite-model-once-compiled for more details
    eventsModel =
        (mongoose.models[MODIFY_POSITION_EVENTS_COLLECTION] as mongoose.Model<
            IModifyPositionEvent,
            {},
            {},
            {},
            any
        >) ||
        model<IModifyPositionEvent>(
            MODIFY_POSITION_EVENTS_COLLECTION,
            eventsSchema
        );
}

export async function findModifyPositionEventsByQuery(
    query: FilterQuery<IModifyPositionEvent>
): Promise<IModifyPositionEvent[]> {
    verifyModel();
    return await eventsModel.find(query);
}

export async function insertModifyPositionEvent(event: IModifyPositionEvent) {
    verifyModel();
    return await eventsModel.create(event);
}

function verifyModel() {
    if (!eventsModel) {
        throw new Error("DB connection not initialized");
    }
}
