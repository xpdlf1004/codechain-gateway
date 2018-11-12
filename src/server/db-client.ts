import * as lowdb from "lowdb";
import * as FileAsync from "lowdb/adapters/FileAsync";

import { Transaction as CoreTransaction } from "codechain-sdk/lib/core/classes";

import { AssetRule } from "../common/types/rules";
import { Transaction, TransactionStatus } from "../common/types/transactions";

interface AssetDB {
    getAssetList(): Promise<string[]>;
    addAsset(assetType: string): Promise<void>;
}

interface TransactionDB {
    getTransactions(): Promise<Transaction[]>;
    addTransaction(
        tx: CoreTransaction,
        origin: string,
        status: TransactionStatus
    ): Promise<void>;
    updateTransactionStatus(
        txhash: string,
        status: TransactionStatus
    ): Promise<Transaction>;
}

interface AccountDB {
    getFeePayer(): Promise<string | null>;
    setFeePayer(address: string): Promise<void>;
}

interface TransactionRuleDB {
    setAssetRule(assetType: string, rule: AssetRule): Promise<void>;
    getAssetRule(assetType: string): Promise<AssetRule>;
}

export class DatabaseLowdbClient
    implements AssetDB, TransactionDB, AccountDB, TransactionRuleDB {
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
        await this.db
            .defaults({
                assets: [],
                txs: [],
                feePayer: null,
                rules: {
                    assets: {}
                }
            })
            .write();
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

    public async addTransaction(
        tx: CoreTransaction,
        origin: string,
        status: TransactionStatus
    ) {
        if (!this.db) {
            throw Error(`DatabaseClient is not initialized`);
        }
        const txhash = tx.hash().value;
        const created = Date.now();
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

    public async updateTransactionStatus(
        txhash: string,
        status: TransactionStatus
    ): Promise<Transaction> {
        if (!this.db) {
            throw Error(`DatabaseClient is not initialized`);
        }
        const updated = Date.now();
        return this.db
            .get("txs")
            .find({ txhash })
            .assign({ status, updated })
            .write() as Promise<Transaction>;
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

    public async setAssetRule(
        assetType: string,
        rule: AssetRule
    ): Promise<void> {
        if (!this.db) {
            throw Error(`DatabaseClient is not initialized`);
        }
        if (!this.isAssetExist(assetType)) {
            throw Error(`No such asset exists: ${assetType}`);
        }
        return this.db.set(`rules.assets.${assetType}`, rule).write();
    }

    public async getAssetRule(assetType: string): Promise<AssetRule> {
        if (!this.db) {
            throw Error(`DatabaseClient is not initialized`);
        }
        if (!this.isAssetExist(assetType)) {
            throw Error(`No such asset exists: ${assetType}`);
        }
        const rule = this.db.get(`rules.assets.${assetType}`).value() || {
            allowed: false
        };
        return rule;
    }

    private async isAssetExist(assetType: string): Promise<boolean> {
        return (
            (await this.getAssetList()).findIndex(
                value => value === assetType
            ) !== -1
        );
    }
}
