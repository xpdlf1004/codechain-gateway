import * as express from "express";

import { MintTransactionInputGroupValue } from "../../common/types/transactions";
import { ServerContext } from "../context";

export const createAssetApiRouter = (context: ServerContext) => {
    const router = express.Router();

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

        const pubkeyhash = await context.cckey.asset.createKey({});
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

    router.get("/:type", async (req, res) => {
        const { type } = req.params;
        context.indexer
            .getAssetInfo(type)
            .then(assetScheme => {
                res.status(200).json(assetScheme);
            })
            .catch(() => {
                res.status(500).send();
            });
    });

    router.get("/:type/owners", async (req, res) => {
        const { type } = req.params;
        context.indexer
            .getUTXOs(type)
            .then(utxos => {
                const ownerBalanceMap = utxos.reduce((map, utxo) => {
                    const { address, amount } = utxo;
                    if (address in map) {
                        map[address] += amount;
                    } else {
                        map[address] = amount;
                    }
                    return map;
                }, {});
                res.status(200).json(ownerBalanceMap);
            })
            .catch(() => {
                res.status(500).send();
            });
    });

    return router;
};
