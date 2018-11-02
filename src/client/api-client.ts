import { MintTransactionInputGroupValue } from "../common/types/transactions";

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

    private get(path: string): Promise<any> {
        return fetch(`${this.baseUrl}/${path}`).then(r => r.json());
    }

    private post(path: string, body?: any): Promise<any> {
        return fetch(`${this.baseUrl}/${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: body === undefined ? undefined : JSON.stringify(body)
        }).then(r => r.json());
    }

    private delete(path: string): Promise<any> {
        return fetch(`${this.baseUrl}/${path}`, { method: "DELETE" });
    }
}