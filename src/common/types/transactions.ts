import {
    AssetTransferAddress,
    H160,
    PlatformAddress
} from "codechain-primitives/lib";
import { Transaction as CoreTransaction } from "codechain-sdk/lib/core/classes";

export type RecipientSelectValue =
    | {
          type: "create";
      }
    | {
          type: "address";
          address: AssetTransferAddress;
      }
    | {
          type: "lock-script-hash";
          lockScriptHash: H160;
          parameters: Buffer[];
      };

export type RegistrarSelectValue = PlatformAddress | "none";

export interface MintTransactionInputValue {
    recipient: RecipientSelectValue;
    amount: number;
    metadata: string;
    registrar: RegistrarSelectValue;
}

export interface TransferOutputInputGroupValue {
    recipient: RecipientSelectValue;
    amount: number;
    assetType: string;
}

export type TransactionStatus =
    | {
          type: "pending";
      }
    | {
          type: "rejected";
          reason: string;
      }
    | {
          type: "errored";
          reason: string;
      }
    | {
          type: "dropped";
      }
    | {
          type: "failed";
          reason: string;
      }
    | {
          type: "successful";
      };

export interface Transaction {
    txhash: string;
    tx: CoreTransaction;
    created: number;
    updated?: number | null;
    origin: string;
    status: TransactionStatus;
}
