import fetch from "node-fetch";

import { AssetDoc, UTXO } from "codechain-indexer-types/lib/types";
import { SDK } from "codechain-sdk";

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

    public getUTXOs(
        type: string
    ): Promise<{ address: string; amount: number }[]> {
        return this.call(`utxo/0x${type}`).then((utxos: UTXO[]) => {
            // FIXME: Consider non-P2PKH address.
            return utxos.map(utxo => ({
                address: getP2PKHAddress(utxo.asset),
                amount: utxo.asset.amount
            }));
        });
    }

    private call(path: string): Promise<any> {
        return fetch(`${this.baseUrl}/${path}`).then(r => r.json());
    }
}

const getP2PKHAddress = (asset: AssetDoc): string => {
    const type = 1;
    const payload = Buffer.from(asset.parameters[0]).toString("hex");
    return SDK.Core.classes.AssetTransferAddress.fromTypeAndPayload(
        type,
        payload
    ).value;
};
