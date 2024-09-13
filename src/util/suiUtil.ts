import { DevInspectResults, TransactionBlock } from "@mysten/sui.js";
import { Market } from "@src/markets/markets";
import {
    SUI_DECIMALS,
    SUI_TYPE,
    TESTNET_PROVIDER,
    TESTNET_SIGNER,
} from "@src/util/constants";
import { logError } from "@src/util/logger";

export async function devInspectTransactionBlock(
    txb: TransactionBlock
): Promise<DevInspectResults> {
    const sender = await TESTNET_SIGNER.getAddress(); // just for read functions
    return await TESTNET_PROVIDER.devInspectTransactionBlock({
        sender,
        transactionBlock: txb,
    });
}

/**
 * Takes the results of a transaction block and parses them according to the object in the parsing template
 * @param txnResults the results of the transaction block
 * @param txnResultsTemplate template for the structure of the transaction results
 */
export function parseTransactionResults(
    devInspectResults: DevInspectResults,
    txnResultsTemplate: any[]
) {
    if (devInspectResults.error) {
        logError(null, `Error parsing txn results: ${devInspectResults.error}`);
        return;
    }

    const txnResults = devInspectResults.results;
    if (!txnResults) {
        logError(null, "Error parsing txn results: No results");
        return;
    }

    for (let i = 0; i < txnResultsTemplate.length; i++) {
        let j = 0;
        const templateItem = txnResultsTemplate[i];
        const txnResult = txnResults[i];
        for (const key in templateItem) {
            if (!key) {
                continue;
            }

            const keyType = typeof templateItem[key];
            if (!txnResult.returnValues || !txnResult.returnValues[j]) {
                logError(
                    null,
                    `Error parsing txn results: No return value for ${key}`
                );
                continue;
            }

            const byteArray = txnResult.returnValues[j][0];
            let suiResult;
            if (keyType === "boolean") {
                suiResult = byteArrayToNum(byteArray) === 1;
            } else if (keyType === "string") {
                suiResult = byteArrayToHexString(byteArray);
            } else if (keyType === "object") {
                suiResult = byteArrayToAddressArray(byteArray);
            } else {
                suiResult = byteArrayToNum(byteArray);
            }

            templateItem[key] = suiResult;
            j++;
        }
    }
}

//TODO This will only work with js numbers, need to use bignumbers in the future
function byteArrayToNum(byteArray: number[]) {
    var value = 0;
    for (var i = byteArray.length - 1; i >= 0; i--) {
        value = value * 256 + byteArray[i];
    }

    return value;
}

function byteArrayToHexString(byteArray: number[]) {
    const hexString =
        "0x" +
        byteArray
            .map((num) => {
                let hex = num.toString(16); // Convert number to hex
                if (hex.length === 1) {
                    hex = "0" + hex; // Pad with a zero if only one character
                }
                return hex;
            })
            .join("");
    return hexString;
}

//TODO This will only work with js numbers, need to use bignumbers in the future
function byteArrayToString(byteArray: number[]) {
    let result = "";
    for (var i = 0; i < byteArray.length; i++) {
        result += String.fromCharCode(byteArray[i]);
    }

    return result;
}

function byteArrayToAddressArray(byteArray: number[]): string[] {
    const result = [];
    // first element is the length of the array
    const numAddresses = byteArray[0];
    const addressSize = 32;
    for (var i = 0; i < numAddresses; i++) {
        result.push(
            byteArrayToHexString(
                byteArray.slice(i * addressSize + 1, (i + 1) * addressSize + 1)
            )
        );
    }

    return result;
}

// For some reason the @mysten/sui does not export a type for this, but it comes back in a ptb result
interface BalanceChange {
    owner:
        | {
              AddressOwner: string;
          }
        | {
              ObjectOwner: string;
          }
        | {
              Shared: {
                  initial_shared_version: number;
              };
          }
        | "Immutable";
    coinType: string;
    amount: string;
}

export interface KeeperBalanceChanges {
    suiBalanceChange: number;
    quoteAssetBalanceChange: number;
}

// Parses and returns the SUI and QuoteAsset balance changes for the keeper
export function parseKeeperBalanceChanges(
    balanceChanges: BalanceChange[] | undefined,
    keeperAddress: string,
    market: Market
): KeeperBalanceChanges {
    if (!balanceChanges) {
        return { suiBalanceChange: 0, quoteAssetBalanceChange: 0 };
    }

    let suiBalanceChange = 0;
    let quoteAssetBalanceChange = 0;
    balanceChanges.forEach((bc) => {
        if (typeof bc.owner !== "object" || !("AddressOwner" in bc.owner)) {
            return;
        }

        const addressOwner = bc.owner["AddressOwner"];
        if (!addressOwner || addressOwner !== keeperAddress) {
            return;
        }

        const amount = Number(bc.amount);
        if (bc.coinType === SUI_TYPE) {
            suiBalanceChange += amount / 10 ** SUI_DECIMALS;
        } else if (bc.coinType === market.quoteAsset.suiType) {
            quoteAssetBalanceChange += amount / 10 ** market.decimals;
        }
    });
    return { suiBalanceChange, quoteAssetBalanceChange };
}
