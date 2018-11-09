import * as lowdb from "lowdb";
import * as FileAsync from "lowdb/adapters/FileAsync";

import { Transaction as CoreTransaction } from "codechain-sdk/lib/core/classes";

import { Transaction } from "../common/types/transactions";

interface AssetDB {
    getAssetList(): Promise<string[]>;
    addAsset(assetType: string): Promise<void>;
}

interface TransactionDB {
    getTransactions(): Promise<Transaction[]>;
    addTransaction(tx: CoreTransaction, origin: string): Promise<void>;
    updateTransactionStatus(txhash: string, status: string): Promise<void>;
}

interface AccountDB {
    getFeePayer(): Promise<string | null>;
    setFeePayer(address: string): Promise<void>;
}

export class DatabaseLowdbClient implements AssetDB, TransactionDB, AccountDB {
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
        await this.db.defaults({ assets: [], txs: [], feePayer: null }).write();
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
        this.db
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

    public async getFeePayer(): Promise<string | null> {
        if (!this.db) {
            throw Error(`DatabaseClient is not initialized`);
        }
        const feePayer = this.db.get("feePayer").value();
        return Promise.resolve(feePayer);
    }

    public async setFeePayer(address: string): Promise<void> {
        if (!this.db) {
            throw Error(`DatabaseClient is not initialized`);
        }
        return this.db.set("feePayer", address).write();
    }
}
