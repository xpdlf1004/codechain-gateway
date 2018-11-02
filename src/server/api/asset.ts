import * as express from "express";

import { CCKey } from "codechain-keystore";

import { ServerContext } from "..";
import { MintTransactionInputGroupValue } from "../../common/types/transactions";

// FIXME: remove async by replacing creating CCKey with that of the context.
export const createAssetApiRouter = async (context: ServerContext) => {
    const router = express.Router();
    const cckey = await CCKey.create({ dbPath: "keystore.db" });

    router.post("/mint", async (req, res) => {
        const { mintValue, feePayer } = req.body;
        // FIXME: Check mintValue is MintTransactionInputGroupValue
        const {
            recipient,
            amount,
            metadata,
            registrar
        } = mintValue as MintTransactionInputGroupValue;

        if (recipient !== "create") {
            // FIXME: not implemented
            return res.status(500).send();
        }

        const pubkeyhash = await cckey.asset.createKey({});
        const address = context.sdk.core.classes.AssetTransferAddress.fromTypeAndPayload(
            1,
            pubkeyhash
        );

        const mintTx = context.sdk.core.createAssetMintTransaction({
            scheme: {
                shardId: 0,
                worldId: 0,
                metadata,
                amount,
                registrar: registrar === "none" ? undefined : registrar
            },
            recipient: address
        });
        const parcel = context.sdk.core.createAssetTransactionGroupParcel({
            transactions: [mintTx]
        });
        // FIXME: seq
        context.sdk.rpc.chain
            .getNonce(feePayer)
            .then(nonce =>
                context.sdk.key.signParcel(parcel, {
                    account: feePayer,
                    fee: 10,
                    nonce
                })
            )
            .then(signedParcel =>
                context.sdk.rpc.chain.sendSignedParcel(signedParcel)
            )
            .then(hash =>
                Promise.all([
                    hash,
                    context.db
                        .get("assets")
                        .push(mintTx.getMintedAsset().assetType.value)
                        .write()
                ])
            )
            .then(([hash]) => {
                res.status(200).json(hash.value);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send();
            });
        return;
    });

    router.get("/list", async (req, res) => {
        res.status(200).json(context.db.get("assets").value());
    });

    return router;
};
