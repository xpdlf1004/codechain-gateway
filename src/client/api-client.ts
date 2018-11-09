import {
    MintTransactionInputGroupValue,
    Transaction,
    TransferOutputInputGroupValue
} from "../common/types/transactions";

export class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = "//localhost:4000";
    }

    // Account
    public getAccountList = (): Promise<{ accounts: string[] }> =>
        this.get("account/list");
    public getAccountDetail = (
        address: string
    ): Promise<{ balance: string; seq: string }> =>
        this.get(`account/${address}`);
    public createAccount = (): Promise<string> => this.post("account/new");
    public removeAccount = (address: string): Promise<void> =>
        this.delete(`account/${address}`);
    public getFeePayer = (): Promise<string | null> =>
        this.get(`account/fee-payer`);
    public setFeePayer = (address: string): Promise<void> =>
        this.post(`account/fee-payer`, { address });

    // Asset
    public getAssetList = (): Promise<string[]> => this.get("asset/list");
    public getAssetDetail = (
        assetType: string
    ): Promise<{
        metadata: any;
        registrar: any;
        amount: any;
        networkId: string;
    }> => this.get(`asset/${assetType}`);
    public mintAsset = (
        mintValue: MintTransactionInputGroupValue,
        feePayer: string
    ): Promise<string> => this.post("asset/mint", { feePayer, mintValue });
    public transferAsset = (
        transferValue: TransferOutputInputGroupValue,
        sender: string,
        feePayer: string
    ): Promise<string> =>
        this.post("asset/transfer", { feePayer, sender, transferValue });

    public getAssetOwners = (
        assetType: string
    ): Promise<{ [owner: string]: number }> =>
        this.get(`asset/${assetType}/owners`);

    // AssetAddress
    public getAssetAddressList = (): Promise<{ addresses: string[] }> =>
        this.get(`asset-address/list`);
    public removeAssetAddress = (address: string): Promise<void> =>
        this.delete(`asset-address/${address}`);

    // Transaction
    public getTransactionList = (): Promise<{ transactions: Transaction[] }> =>
        this.get(`transaction/list`);

    public uploadImage = (image: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append("image", image);
        return this.post(`image`, formData);
    };

    private get(path: string): Promise<any> {
        return fetch(`${this.baseUrl}/${path}`).then(r => {
            if (r.status >= 400) {
                return Promise.reject(Error(`GET ${path}: ${r.statusText}`));
            }
            return r.json();
        });
    }

    private post(path: string, body?: any): Promise<any> {
        return fetch(
            `${this.baseUrl}/${path}`,
            this.createRequestInit("POST", body)
        ).then(r => {
            if (r.status >= 400) {
                return Promise.reject(Error(`POST ${path}: ${r.statusText}`));
            }
            return r.json();
        });
    }

    private put(path: string, body?: any): Promise<any> {
        return fetch(
            `${this.baseUrl}/${path}`,
            this.createRequestInit("PUT", body)
        ).then(r => {
            if (r.status >= 400) {
                return Promise.reject(Error(`PUT ${path}: ${r.statusText}`));
            }
            return r.json();
        });
    }

    private delete(path: string): Promise<any> {
        return fetch(`${this.baseUrl}/${path}`, { method: "DELETE" }).then(
            r => {
                if (r.status >= 400) {
                    return Promise.reject(
                        Error(`DELETE ${path}: ${r.statusText}`)
                    );
                }
                return Promise.resolve(r);
            }
        );
    }

    private createRequestInit(
        method: "POST" | "PUT" | "DELETE",
        body: any
    ): RequestInit {
        return body instanceof FormData
            ? {
                  method,
                  body
              }
            : {
                  method,
                  headers: {
                      "Content-Type": "application/json"
                  },
                  body: body === undefined ? undefined : JSON.stringify(body)
              };
    }
}
