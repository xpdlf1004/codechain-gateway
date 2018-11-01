import { H160, PlatformAddress } from "codechain-primitives/lib";

export type AssetTransferAddress = string;
export type RecipientSelectValue =
    | "create"
    | AssetTransferAddress
    | {
          lockScriptHash: H160;
          parameters: Buffer[];
      };

export type RegistrarSelectValue = PlatformAddress | "none";

export interface MintTransactionInputGroupValue {
    recipient: RecipientSelectValue;
    amount: number;
    metadata: string;
    registrar: RegistrarSelectValue;
}
