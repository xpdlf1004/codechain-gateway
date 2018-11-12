export type Asset = string;

export interface AssetScheme {
    metadata: string;
    registrar: string | null;
    amount: number | null;
    networkId: string;
}
