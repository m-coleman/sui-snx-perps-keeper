import { logError, logInfo } from "@src/util/logger";
import mongoose from "mongoose";

export async function establishMongoDBConnection() {
    const mongoDbName = process.env.MONGODB_NAME;
    if (!mongoDbName) {
        throw new Error(
            "Environment variable MONGODB_NAME needs to be set to establish MongoDB connection"
        );
    }

    const mongoDbUsername = process.env.MONGODB_USERNAME;
    if (!mongoDbUsername) {
        throw new Error(
            "Environment variable MONGODB_USERNAME needs to be set to establish MongoDB connection"
        );
    }

    const mongoDbPassword = process.env.MONGODB_PASSWORD;
    if (!mongoDbPassword) {
        throw new Error(
            "Environment variable MONGODB_PASSWORD needs to be set to establish MongoDB connection"
        );
    }

    const mongoDbClusterName = process.env.MONGODB_CLUSTER_NAME;
    if (!mongoDbClusterName) {
        throw new Error(
            "Environment variable MONGODB_CLUSTER_NAME needs to be set to establish MongoDB connection"
        );
    }

    // setup the connection
    const mongoUrl = `mongodb+srv://${mongoDbUsername}:${mongoDbPassword}@${mongoDbClusterName}.mongodb.net/${mongoDbName}?retryWrites=true&w=majority`;
    mongoose.set("strictQuery", false);
    await mongoose.connect(mongoUrl);

    // setup error handling
    mongoose.connection.on("error", (err) => {
        logError(null, "MongoDB connection error", err);
    });

    logInfo(
        null,
        `MongoDB Connection Established to database: ${mongoDbName}, on cluster ${mongoDbClusterName}`
    );
}
