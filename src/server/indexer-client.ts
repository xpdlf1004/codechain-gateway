import fetch from "node-fetch";

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

    private call(path: string): Promise<any> {
        return fetch(`${this.baseUrl}/${path}`).then(r => r.json());
    }
}
