import fetch from "node-fetch";

import {
    AssetSchemeDoc,
    PendingTransactionDoc,
    TransactionDoc,
    UTXO
} from "codechain-indexer-types/lib/types";

export class IndexerClient {
    private baseUrl: string;

    constructor(baseUrl: string, options?: { ping?: boolean }) {
        this.baseUrl = baseUrl;

        const { ping = false } = options || {};

        if (ping) {
            this.call("ping")
                .then(() => {
                    console.info("indexer ping succeeded");
                })
                .catch(e => {
                    console.warn(`indexer ping failed: `, e);
                });
        }
    }

    public getAssetScheme(type: string): Promise<AssetSchemeDoc | null> {
        return this.call(`asset/0x${type}`);
    }

    public getTransaction(hash: string): Promise<TransactionDoc | null> {
        return this.call(`tx/${hash}`);
    }

    public getPendingTransaction(
        hash: string
    ): Promise<PendingTransactionDoc | null> {
        return this.call(`tx/pending/${hash}`);
    }

    public getUTXOs(type: string, address?: string): Promise<UTXO[]> {
        if (address) {
            return this.call(`utxo/0x${type}/owner/${address}`);
        } else {
            return this.call(`utxo/0x${type}`);
        }
    }

    private call(path: string): Promise<any> {
        return fetch(`${this.baseUrl}/${path}`).then(r => r.json());
    }
}
