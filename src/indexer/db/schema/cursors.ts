import { MONGO_REQUIRED_STRING, TIMESTAMPS } from "@src/indexer/db/dbConstants";
import mongoose, {
    Schema,
    model,
    FilterQuery,
    Model,
    UpdateQuery,
    QueryOptions,
} from "mongoose";

export const CURSORS_COLLECTION = "cursors";

export interface ICursor {
    module: string;
    txDigest: string;
    eventSeq: string;
}

let cursorsModel: Model<ICursor, {}, {}, {}, any>;
if (process.env.MONGODB_NAME) {
    // mongo schema
    const cursorsSchema = new Schema<ICursor>({
        module: MONGO_REQUIRED_STRING,
        txDigest: MONGO_REQUIRED_STRING,
        eventSeq: MONGO_REQUIRED_STRING,
    });

    cursorsSchema.set(TIMESTAMPS, true);

    // Due to a nextJS issue with mongo, we need to first check and return the model if it has already been created
    // see https://stackoverflow.com/questions/62440264/mongoose-nextjs-model-is-not-defined-cannot-overwrite-model-once-compiled for more details
    cursorsModel =
        (mongoose.models[CURSORS_COLLECTION] as mongoose.Model<
            ICursor,
            {},
            {},
            {},
            any
        >) || model<ICursor>(CURSORS_COLLECTION, cursorsSchema);
}

export async function findOneCursorByQuery(
    query: FilterQuery<ICursor>
): Promise<ICursor | null> {
    verifyModel();
    return await cursorsModel.findOne(query);
}

export async function upsertCursor(cursor: ICursor) {
    verifyModel();
    const query: FilterQuery<ICursor> = { module: cursor.module };
    const update: UpdateQuery<ICursor> = { $set: cursor };
    const options: QueryOptions = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
    };

    return await cursorsModel.findOneAndUpdate(query, update, options);
}

function verifyModel() {
    if (!cursorsModel) {
        throw new Error("DB connection not initialized");
    }
}
