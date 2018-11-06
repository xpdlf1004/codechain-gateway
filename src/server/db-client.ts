import * as lowdb from "lowdb";
import * as FileAsync from "lowdb/adapters/FileAsync";

export class DatabaseLowdbClient {
    public static async create(path: string) {
        const instance = new this(path);
        await instance.init();
        return instance;
    }

    private path: string;
    private db: lowdb.LowdbAsync<any> | null;

    constructor(path: string) {
        this.path = path;
        this.db = null;
    }

    public async init() {
        const adapter = new FileAsync(this.path);
        this.db = await lowdb(adapter);
        await this.db.defaults({ assets: [] }).write();
    }

    public async getAssetList(): Promise<string[]> {
        if (!this.db) {
            throw Error(`DatabaseClient is not initialized`);
        }
        const assets = this.db.get("assets").value();
        return Promise.resolve(assets);
    }

    public async addAsset(assetType: string) {
        if (!this.db) {
            throw Error(`DatabaseClient is not initialized`);
        }
        return this.db
            .get("assets")
            .push(assetType)
            .write();
    }
}
