import { MONGO_REQUIRED_STRING, TIMESTAMPS } from "@src/indexer/db/dbConstants";
import { SnxEventType } from "@src/indexer/interfaces";
import mongoose, {
    Schema,
    model,
    FilterQuery,
    Model,
    ObjectId,
} from "mongoose";

export const EVENTS_COLLECTION = "events";

// common to all emitted events
export interface IEvent {
    txDigest: string;
    eventSeq: string;
    packageId: string;
    transactionModule: string;
    sender: string;
    type: string;
    timestampMs: string;
    // readable type without the package or module prefix
    readableType: SnxEventType;
    // the data specific to each event
    rawEventData: Record<string, any>;
    // who the event is for. Almost always the sender except for keeper events like OrderExecuted and PositionLiquidated.
    // For keeper events, this is the account that the keeper is executing for.
    account: string;
    // market info. Mandatory b/c all but 2 events (GlobalMarketsEnabled and GlobalMarketsVersionMigrated) have a market
    baseAsset: string;
    quoteAsset: string;

    // mongo fields
    createdAt?: Date;
    updatedAt?: Date;
    _id?: ObjectId;
    __v?: number;
}

let eventsModel: Model<IEvent, {}, {}, {}, any>;
if (process.env.MONGODB_NAME) {
    // mongo schema
    const eventsSchema = new Schema<IEvent>({
        txDigest: MONGO_REQUIRED_STRING,
        eventSeq: MONGO_REQUIRED_STRING,
        packageId: MONGO_REQUIRED_STRING,
        transactionModule: MONGO_REQUIRED_STRING,
        sender: MONGO_REQUIRED_STRING,
        type: MONGO_REQUIRED_STRING,
        timestampMs: MONGO_REQUIRED_STRING,
        readableType: MONGO_REQUIRED_STRING,
        rawEventData: mongoose.Schema.Types.Mixed,
        account: MONGO_REQUIRED_STRING,
        baseAsset: MONGO_REQUIRED_STRING,
        quoteAsset: MONGO_REQUIRED_STRING,
    });

    eventsSchema.set(TIMESTAMPS, true);
    eventsSchema.index({ readableType: 1 });
    eventsSchema.index({ account: 1 });
    eventsSchema.index({ readableType: 1, account: 1 });

    // Due to a nextJS issue with mongo, we need to first check and return the model if it has already been created
    // see https://stackoverflow.com/questions/62440264/mongoose-nextjs-model-is-not-defined-cannot-overwrite-model-once-compiled for more details
    eventsModel =
        (mongoose.models[EVENTS_COLLECTION] as mongoose.Model<
            IEvent,
            {},
            {},
            {},
            any
        >) || model<IEvent>(EVENTS_COLLECTION, eventsSchema);
}

export async function findEventsByQuery(
    query: FilterQuery<IEvent>
): Promise<IEvent[]> {
    verifyModel();
    return await eventsModel.find(query);
}

export async function insertEvent(event: IEvent) {
    verifyModel();
    return await eventsModel.create(event);
}

function verifyModel() {
    if (!eventsModel) {
        throw new Error("DB connection not initialized");
    }
}
