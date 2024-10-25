import { ObjectId } from "mongoose";

export const TIMESTAMPS = "timestamps";
export const MONGO_REQUIRED_STRING = {
    type: String,
    required: true,
};
export const MONGO_REQUIRED_NUMBER = {
    type: Number,
    required: true,
};
export const MONGO_REQUIRED_BOOLEAN = {
    type: Boolean,
    required: true,
};
export const MONGO_REQUIRED_DATE = {
    type: Date,
    required: true,
};

// common to all emitted events
export interface IEvent {
    txDigest: string;
    eventSeq: string;
    packageId: string;
    transactionModule: string;
    sender: string;
    type: string;
    timestampMs: string;
    // market info (optional)
    baseAsset?: string;
    quoteAsset?: string;

    // mongo fields
    createdAt?: Date;
    updatedAt?: Date;
    _id?: ObjectId;
    __v?: number;
}

export const eventSchema = {
    txDigest: MONGO_REQUIRED_STRING,
    eventSeq: MONGO_REQUIRED_STRING,
    packageId: MONGO_REQUIRED_STRING,
    transactionModule: MONGO_REQUIRED_STRING,
    sender: MONGO_REQUIRED_STRING,
    type: MONGO_REQUIRED_STRING,
    timestampMs: MONGO_REQUIRED_STRING,
    baseAsset: String,
    quoteAsset: String,
};
