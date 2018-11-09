import * as express from "express";

import { AssetDoc, UTXO } from "codechain-indexer-types/lib/types";
import { AssetTransferAddress } from "codechain-primitives/lib";
import { SDK } from "codechain-sdk";
import { Asset } from "codechain-sdk/lib/core/Asset";
import {
    MintTransactionInputValue,
    TransferOutputInputGroupValue
} from "../../common/types/transactions";
import { ServerContext } from "../context";

export const createAssetApiRouter = (context: ServerContext) => {
    const router = express.Router();

    router.post("/mint", async (req, res) => {
        const { mintValue, feePayer } = req.body;
        // FIXME: Check mintValue is MintTransactionInputValue
        const {
            amount,
            metadata,
            registrar
        } = mintValue as MintTransactionInputValue;
        let { recipient } = mintValue as MintTransactionInputValue;

        if (recipient.type !== "create" && "lockScriptHash" in recipient) {
            // FIXME: not implemented
            return res.status(500).send();
        }

        if (recipient.type === "create") {
            const pubkeyhash = await context.cckey.asset.createKey({});
            const address = context.sdk.core.classes.AssetTransferAddress.fromTypeAndPayload(
                1,
                pubkeyhash
            );
            recipient = { type: "address", address };
        } else {
            recipient = {
                type: "address",
                address: AssetTransferAddress.fromString(
                    recipient.address.value
                )
            };
        }

        const mintTx = context.sdk.core.createAssetMintTransaction({
            scheme: {
                shardId: 0,
                worldId: 0,
                metadata,
                amount,
                registrar: registrar === "none" ? undefined : registrar
            },
            recipient: recipient.address
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
                    context.db.addAsset(
                        mintTx.getMintedAsset().assetType.value
                    ),
                    context.db.addTransaction(mintTx, "admin")
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

    router.post("/transfer", async (req, res) => {
        const { transferValue, feePayer, sender } = req.body as {
            transferValue: TransferOutputInputGroupValue;
            feePayer: string;
            sender: string;
        };
        // FIXME: Check the values are valid
        const {
            amount,
            assetType
        } = transferValue as TransferOutputInputGroupValue;
        let { recipient } = transferValue as TransferOutputInputGroupValue;

        if (recipient.type !== "create" && "lockScriptHash" in recipient) {
            // FIXME: not implemented
            return res.status(500).send();
        }

        if (recipient.type === "create") {
            const pubkeyhash = await context.cckey.asset.createKey({});
            const address = context.sdk.core.classes.AssetTransferAddress.fromTypeAndPayload(
                1,
                pubkeyhash
            );
            recipient = { type: "address", address };
        } else {
            recipient = {
                type: "address",
                address: AssetTransferAddress.fromString(
                    recipient.address.value
                )
            };
        }

        const transferTx = context.sdk.core.createAssetTransferTransaction();
        const utxoAssets = (await context.indexer.getUTXOs(
            assetType,
            sender
        )).map((utxo: UTXO) =>
            Asset.fromJSON({
                ...utxo.asset,
                // FIXME:
                lock_script_hash: utxo.asset.lockScriptHash,
                asset_type: utxo.asset.assetType
            })
        );
        const inputSum = utxoAssets.reduce(
            (sum: number, utxoAsset: Asset) => (sum += utxoAsset.amount),
            0
        );
        if (inputSum < amount) {
            return res.status(500).send();
        }
        transferTx.addInputs(utxoAssets);
        transferTx.addOutputs({
            amount,
            assetType,
            recipient: recipient.address
        });
        if (inputSum > amount) {
            transferTx.addOutputs({
                amount: inputSum - amount,
                assetType,
                recipient: sender
            });
        }
        for (let i = 0; i < transferTx.inputs.length; i++) {
            await context.sdk.key.signTransactionInput(transferTx, i);
        }
        const parcel = context.sdk.core.createAssetTransactionGroupParcel({
            transactions: [transferTx]
        });

        return context.sdk.rpc.chain
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
            .then(hash => res.status(200).json(hash.value))
            .catch(err => {
                console.error(err);
                res.status(500).send();
            });
    });

    router.get("/list", async (req, res) => {
        res.status(200).json(await context.db.getAssetList());
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
                const ownerBalanceMap = utxos
                    .map(utxo => ({
                        address: getP2PKHAddress(utxo.asset),
                        amount: utxo.asset.amount
                    }))
                    .reduce((map, utxo) => {
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

const getP2PKHAddress = (asset: AssetDoc): string => {
    const type = 1;
    const payload = Buffer.from(asset.parameters[0]).toString("hex");
    return SDK.Core.classes.AssetTransferAddress.fromTypeAndPayload(
        type,
        payload
    ).value;
};
