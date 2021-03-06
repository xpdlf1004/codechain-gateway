import * as express from "express";
import * as _ from "lodash";

import { AssetTransferTransaction } from "codechain-sdk/lib/core/classes";

import { ServerContext } from "../context";

export const createTransactionApiRouter = (context: ServerContext) => {
    const router = express.Router();

    router.post("/", async (req, res) => {
        let tx: AssetTransferTransaction;
        try {
            tx = AssetTransferTransaction.fromJSON(req.body.tx);
        } catch (err) {
            console.error(err);
            return res.status(400).send();
        }

        try {
            const assetTypes = _.uniq([
                ...tx.burns.map(b => b.prevOut.assetType.value),
                ...tx.inputs.map(i => i.prevOut.assetType.value),
                ...tx.outputs.map(o => o.assetType.value)
            ]);

            await new Promise(async (resolve, reject) => {
                for (const assetType of assetTypes) {
                    const { allowed } = await context.db.getAssetRule(
                        assetType
                    );
                    if (!allowed) {
                        reject(
                            Error(
                                `${assetType} is not allowed to transfer through API`
                            )
                        );
                    }
                }
                resolve();
            });
        } catch (err) {
            console.error(err);
            await context.db.addTransaction(tx, "api", {
                type: "rejected",
                reason: String(err)
            });
            return res.status(401).send();
        }
        try {
            const keyStore = await context.sdk.key.createLocalKeyStore();
            const feePayer = await context.db.getFeePayer();
            if (feePayer == null) {
                throw Error("No fee-payer exist");
            }
            const nonce = await context.sdk.rpc.chain.getNonce(feePayer);
            const parcel = context.sdk.core.createAssetTransactionGroupParcel({
                transactions: [tx]
            });
            const signedParcel = await context.sdk.key.signParcel(parcel, {
                account: feePayer,
                keyStore,
                fee: 10,
                nonce
            });
            await context.sdk.rpc.chain.sendSignedParcel(signedParcel);
            await context.db.addTransaction(tx, "api", { type: "pending" });
            // FIXME: Use a valid protocal format
            return res.json("success");
        } catch (err) {
            console.error(err);
            await context.db.addTransaction(tx, "api", {
                type: "errored",
                reason: String(err)
            });
            return res.status(500).send();
        }
    });

    router.get("/rule/asset/:assetType", (req, res) => {
        // FIXME: check assetType
        // FIXME: check req.body
        const { assetType } = req.params;
        context.db
            .getAssetRule(assetType)
            .then(rule => {
                res.status(200).json(rule);
            })
            .catch(e => {
                console.error(e);
                res.status(500).send();
            });
    });

    router.put("/rule/asset/:assetType", (req, res) => {
        // FIXME: check assetType
        // FIXME: check req.body
        const { assetType } = req.params;
        context.db
            .setAssetRule(assetType, req.body)
            .then(() => {
                res.status(200).json(null);
            })
            .catch(e => {
                console.error(e);
                res.status(500).send();
            });
    });

    router.get("/list", async (req, res) => {
        try {
            let txs = await context.db.getTransactions();

            txs = await Promise.all(
                txs.map(async tx => {
                    const { txhash, status, created } = tx;
                    if (
                        status.type !== "pending" ||
                        // NOTE: Wait indexer to index
                        Date.now() - created < 7000
                    ) {
                        return tx;
                    }
                    const pendingTxDoc = await context.indexer.getPendingTransaction(
                        txhash
                    );
                    console.log(`pendingTxDoc ${pendingTxDoc}`);
                    if (pendingTxDoc) {
                        console.log(`${txhash}: still pending`);
                        return tx;
                    }
                    const txDoc = await context.indexer.getTransaction(txhash);
                    console.log(`txDoc ${txDoc}`);
                    if (txDoc) {
                        console.log(`${txhash}: invoice ${txDoc.data.invoice}`);
                        return context.db.updateTransactionStatus(
                            txhash,
                            txDoc.data.invoice
                                ? { type: "successful" }
                                : {
                                      type: "failed",
                                      reason:
                                          "Currently, invoices don't provide reason"
                                  }
                        );
                    }
                    return context.db.updateTransactionStatus(txhash, {
                        type: "dropped"
                    });
                })
            );
            res.status(200).json({ transactions: txs });
        } catch (err) {
            console.error(err);
            res.status(500).send();
        }
    });

    router.get("/pending/list/asset-address/:address", async (req, res) => {
        const { address } = req.params;
        context.indexer
            .getAssetTransferAddressRelatedPendingTransactions(address)
            .then(pendings => {
                res.status(200).send({ transactions: pendings });
            })
            .catch(err => {
                console.error(err);
                res.status(500).send();
            });
    });

    return router;
};
