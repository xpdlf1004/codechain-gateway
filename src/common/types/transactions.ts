export type AssetTransferAddress = string;
export type PlatformAddress = string;
export type RecipientSelectValue =
    | "create"
    | AssetTransferAddress
    | {
          lockScriptHash: string;
          parameters: Buffer[];
      };

export interface MintTransactionInputGroupValue {
    recipient: RecipientSelectValue;
    amount: number;
    metadata: string;
    registrar: "none" | PlatformAddress;
}
