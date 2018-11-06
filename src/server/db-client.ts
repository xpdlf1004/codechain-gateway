import * as lowdb from "lowdb";
import * as FileAsync from "lowdb/adapters/FileAsync";

import { Transaction as CoreTransaction } from "codechain-sdk/lib/core/classes";

import { Transaction } from "../common/types/transactions";

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
        await this.db.defaults({ assets: [], txs: [] }).write();
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

    public async addTransaction(tx: CoreTransaction, origin: string) {
        if (!this.db) {
            throw Error(`DatabaseClient is not initialized`);
        }
        const txhash = tx.hash().value;
        const created = Date.now();
        const status = "processing";
        return this.db
            .get("txs")
            .push({
                txhash,
                tx: tx.toJSON(),
                created,
                origin,
                status
            })
            .write();
    }

    public async updateTransactionStatus(txhash: string, status: string) {
        if (!this.db) {
            throw Error(`DatabaseClient is not initialized`);
        }
        const updated = Date.now();
        return this.db
            .get("txs")
            .find({ txhash })
            .assign({ status, updated })
            .write();
    }

    public async getTransactions(): Promise<Transaction[]> {
        if (!this.db) {
            throw Error(`DatabaseClient is not initialized`);
        }
        const transactions = this.db.get("txs").value();
        return Promise.resolve(transactions);
    }
}
