import {
    Ed25519Keypair,
    JsonRpcProvider,
    RawSigner,
    testnetConnection,
} from "@mysten/sui.js";
import {
    getGlobalMarketsId,
    getSynthetixAdminCapId,
    getPK,
    getPackageId,
    getProcessIntervalSeconds,
    getRpcBackoffTimeMs,
} from "@src/util/environmentUtil";
import { hexToUint8Array } from "@src/util/util";

export const TESTNET_PROVIDER = new JsonRpcProvider(testnetConnection);
const keypair = Ed25519Keypair.fromSecretKey(hexToUint8Array(getPK()));
export const TESTNET_SIGNER = new RawSigner(keypair, TESTNET_PROVIDER);

// module names
export const MARKET_MODULE_ID = "market";
export const STATE_MODULE_ID = "state";
export const TRADE_MODULE_ID = "trade";
export const STAKE_MODULE_ID = "stake";
export const SETTINGS_MODULE_ID = "settings";
export const MARKET_CORE_MODULE_ID = "market_core";
export const BIG_VECTOR_MODULE_ID = "big_vector";
export const USDC_ID = "usdc6";
export const ORACLE_MODULE_ID = "oracle";
export const ADMIN_SETTINGS_MODULE_ID = "admin_settings";

export const SUI_TYPE = "0x2::sui::SUI";
export const SUI_DECIMALS = 9;
export const CLOCK_ADDR = "0x6";

export const PACKAGE_ID = getPackageId();
export const GLOBAL_MARKETS_ID = getGlobalMarketsId();
export const SYNTHETIX_ADMIN_CAP_ID = getSynthetixAdminCapId();
export const PROCESS_INTERVAL_SECONDS = getProcessIntervalSeconds();
export const RPC_BACKOFF_TIME_MS = getRpcBackoffTimeMs();

// for the number of move calls a pyth price update makes, see:
// https://github.com/pyth-network/pyth-crosschain/blob/9b825597d01cf8a791c18a8edd334b775fc55be1/target_chains/sui/sdk/js/src/client.ts#L109
export const UPDATE_PRICE_FEED_NUM_MOVE_CALLS = 5;
export const UPDATE_INTEREST_RATE_NUM_MOVE_CALLS = 1;
