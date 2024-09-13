import dotenv from "dotenv";

dotenv.config();

export function getPort() {
    return process.env.PORT || 3002;
}

export function getPK() {
    return process.env.PK || "";
}

export function getPackageId() {
    return process.env.NEXT_PUBLIC_PACKAGE_ID || "";
}

export function getUsdcPackageId() {
    return process.env.NEXT_PUBLIC_USDC_PACKAGE_ID || "";
}

export function getSynthsPackageId() {
    return process.env.NEXT_PUBLIC_SYNTHS_PACKAGE_ID || "";
}

export function getGlobalMarketsId() {
    return process.env.NEXT_PUBLIC_GLOBAL_MARKETS_ID || "";
}

export function getSynthetixAdminCapId() {
    return process.env.NEXT_PUBLIC_SYNTHETIX_ADMIN_CAP_ID || "";
}

export function getTreasuryCapId() {
    return process.env.NEXT_PUBLIC_TREASURY_CAP_ID || "";
}

export function getPythPackageId() {
    return process.env.NEXT_PUBLIC_PYTH_PACKAGE_ID || "";
}

export function getPythStateId() {
    return process.env.NEXT_PUBLIC_PYTH_STATE_ID || "";
}

export function getWormholeStateId() {
    return process.env.NEXT_PUBLIC_WORMHOLE_STATE_ID || "";
}

export function getPythVaasApiUrl() {
    return process.env.NEXT_PUBLIC_PYTH_VAAS_API_URL || "";
}

export function getSuiEnv() {
    return process.env.NEXT_PUBLIC_SUI_ENV || "";
}

export function getProcessIntervalSeconds(): number {
    return Number(process.env.PROCESS_INTERVAL_SECONDS) || 5;
}

export function getRpcBackoffTimeMs(): number {
    return Number(process.env.RPC_BAKCOFF_TIME_MS) || 100;
}

type Network = "mainnet" | "testnet" | "devnet" | "localnet";

function isNetwork(value: any): value is Network {
    return ["mainnet", "testnet", "devnet", "localnet"].includes(value);
}

export function getNetwork(): Network {
    const network = process.env.NETWORK;
    if (isNetwork(network)) {
        return network;
    }

    return "testnet";
}
