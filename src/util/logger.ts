import { Market } from "@src/markets/markets";
import { getMarketName } from "@src/markets/marketUtil";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const isProd = process.env.NODE_ENV === "production";
const LOG_FILENAME = isProd ? "/logs/keeper.log" : "logs/keeper.log";

const WINSTON_LOGGER = createWinstonLogger();

export function logInfo(market: Market | null, msg: string) {
    const infoMsg = addMarketPrefix(market, msg);
    WINSTON_LOGGER.info(infoMsg);
}

export function logError(market: Market | null, msg: string, e?: any) {
    const errMsg = addMarketPrefix(market, msg);
    WINSTON_LOGGER.error(errMsg, e);
}

function addMarketPrefix(market: Market | null, msg: string) {
    if (!market) {
        return msg;
    }

    return `[${getMarketName(market)}] ${msg}`;
}

function createWinstonLogger() {
    return winston.createLogger({
        levels: winston.config.npm.levels,
        format: winston.format.combine(
            winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Specify the timestamp format
            winston.format.printf(
                (info) => `${info.timestamp} [${info.level}]: ${info.message}`
            )
        ),
        transports: [
            new winston.transports.Console(),
            new DailyRotateFile({
                filename: LOG_FILENAME,
                datePattern: "YYYY-MM-DD",
                zippedArchive: true,
                maxSize: "20m",
                maxFiles: "7d", // Keep logs for 7 days
            }),
        ],
    });
}
