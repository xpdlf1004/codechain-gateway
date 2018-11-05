import fetch from "node-fetch";

import { UTXO } from "codechain-indexer-types/lib/types";

export class IndexerClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;

        this.call("ping")
            .then(() => {
                console.info("indexer ping succeeded");
            })
            .catch(e => {
                console.warn(`indexer ping failed: `, e);
            });
    }

    public getAssetInfo(type: string): Promise<any> {
        return this.call(`asset/0x${type}`);
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
