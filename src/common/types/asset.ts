export interface Asset {
    type: string;
    name: string;
    mintTxHash: string;
}

export interface AssetDetail {
    type: string;
    name: string;
    mintTxHash: string;
    scheme?: {
        metadata: string;
        registrar: string | null;
        amount: number | null;
        networkId: string;
    };
}
