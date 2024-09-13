import { RPC_BACKOFF_TIME_MS } from "@src/util/constants";
import { getNetwork } from "@src/util/environmentUtil";

export function hexToUint8Array(hexString: string): Uint8Array {
    if (hexString.length % 2 !== 0) {
        throw new Error("Invalid hexString");
    }

    const byteArray = new Uint8Array(hexString.length / 2);

    for (let i = 0, j = 0; i < hexString.length; i += 2, j++) {
        byteArray[j] = parseInt(hexString.substring(i, i + 2), 16);
    }

    return byteArray;
}

export function getBlockExplorerUrl(digest: string) {
    return `https://suiexplorer.com/txblock/${digest}?network=${getNetwork()}`;
}

export async function handleRpcBackoff() {
    return new Promise((resolve) => {
        setTimeout(resolve, RPC_BACKOFF_TIME_MS);
    });
}
