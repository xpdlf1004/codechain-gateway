import * as express from "express";

import { AssetTransferTransaction } from "codechain-sdk/lib/core/classes";

import { ServerContext } from "../context";

export const createTransactionApiRouter = (context: ServerContext) => {
    const router = express.Router();

    router.post("/", async (req, res) => {
        const { tx } = req.body;
        try {
            const keyStore = await context.sdk.key.createLocalKeyStore();
            const feePayer = await context.db.getFeePayer();
            if (feePayer == null) {
                throw Error("No fee-payer exist");
            }
            const nonce = await context.sdk.rpc.chain.getNonce(feePayer);
            const parcel = context.sdk.core.createAssetTransactionGroupParcel({
                transactions: [AssetTransferTransaction.fromJSON(tx)]
            });
            const signedParcel = await context.sdk.key.signParcel(parcel, {
                account: feePayer,
                keyStore,
                fee: 10,
                nonce
            });
            await context.sdk.rpc.chain.sendSignedParcel(signedParcel);
            await context.db.addTransaction(
                AssetTransferTransaction.fromJSON(tx),
                "api"
            );
            // FIXME: Use a valid protocal format
            res.json("success");
        } catch (e) {
            res.status(500).send();
        }
    });

    router.get("/list", async (_, res) => {
        context.db
            .getTransactions()
            .then(transactions => {
                res.status(200).json({ transactions });
            })
            .catch(() => res.status(500).send());
    });

    return router;
};
