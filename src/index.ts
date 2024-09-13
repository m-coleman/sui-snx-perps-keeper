import moduleAlias from "module-alias";
moduleAlias.addAliases({
    "@src": `${__dirname}/`,
});
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { getPort } from "@src/util/environmentUtil";
import { startKeeper } from "@src/keeper";
import { logInfo } from "@src/util/logger";

dotenv.config();
const app = express();

const PORT = getPort();

app.listen(PORT, () => {
    logInfo(null, `Starting sui-snx-perps-keeper on port ${PORT}`);
    startKeeper();
});
