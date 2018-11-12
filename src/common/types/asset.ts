export interface Asset {
    type: string;
    name: string;
    mintTxHash: string;
}

export interface AssetScheme {
    metadata: string;
    registrar: string | null;
    amount: number | null;
    networkId: string;
}
