import moduleAlias from "module-alias";
moduleAlias.addAliases({
    "@src": `${__dirname}/`,
});
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import {
    getPort,
    getRunEventIndexer,
    getRunKeeper,
} from "@src/util/environmentUtil";
import { startKeeper } from "@src/keeper/keeper";
import { logInfo } from "@src/util/logger";
import { startEventIndexer } from "@src/indexer/eventIndexer";

dotenv.config();
const app = express();

const PORT = getPort();

app.listen(PORT, () => {
    logInfo(null, `Starting sui-snx-perps-keeper on port ${PORT}`);

    // run keeper if enabled
    if (getRunKeeper()) {
        startKeeper();
    } else {
        logInfo(
            null,
            "Not running keeper, RUN_KEEPER env var is not set to true"
        );
    }

    // run event indexer if enabled
    if (getRunEventIndexer()) {
        startEventIndexer();
    } else {
        logInfo(
            null,
            "Not running event indexer, RUN_EVENT_INDEXER env var is not set to true"
        );
    }
});
