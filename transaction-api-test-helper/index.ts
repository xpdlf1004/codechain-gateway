import { SDK } from "codechain-sdk";

import { Asset } from "codechain-sdk/lib/core/Asset";
import { Transaction } from "codechain-sdk/lib/core/classes";
import fetch from "node-fetch";
import { DatabaseLowdbClient } from "../src/server/db-client";
import { IndexerClient } from "../src/server/indexer-client";

const List = require("prompt-list");
const Input = require("prompt-input");

async function main() {
    const sdk = new SDK({ server: "" });
    const db = await DatabaseLowdbClient.create("./helper-db.json");
    const indexer = new IndexerClient(
        "https://husky.codechain.io/explorer/api/"
    );

    const answer = await new List({
        message: "Select action",
        choices: ["transfer-asset", "show-addresses", "create-address"]
    }).run();

    switch (answer) {
        case "create-address":
            const address = await sdk.key.createAssetTransferAddress();
            console.log(address.toString());
            break;
        case "show-addresses":
            const keyStore2 = await sdk.key.createLocalKeyStore();
            const keys2 = await keyStore2.asset.getKeyList();
            const addresses2 = keys2.map(k =>
                sdk.core.classes.AssetTransferAddress.fromTypeAndPayload(
                    1,
                    k
                ).toString()
            );
            addresses2.forEach(a => console.log(a));
            break;
        case "transfer-asset":
            const assetTypes = await db.getAssetList();
            if (assetTypes.length === 0) {
                return console.info("No asset exist");
            }
            const assetType = await new List({
                message: "Which asset?",
                choices: assetTypes
            }).run();
            if (assetType === undefined) {
                return console.info("Not selected");
            }

            const keyStore = await sdk.key.createLocalKeyStore();
            const keys = await keyStore.asset.getKeyList();
            const addresses = keys.map(k =>
                sdk.core.classes.AssetTransferAddress.fromTypeAndPayload(
                    1,
                    k
                ).toString()
            );

            const selectedAddress = await new List({
                message: "Who spends?",
                choices: addresses
            }).run();

            if (selectedAddress === undefined) {
                return console.log("Sender is not selected");
            }

            const utxos = await indexer.getUTXOs(assetType, selectedAddress);
            const utxoAssets = utxos.map(utxo =>
                Asset.fromJSON({
                    ...utxo.asset,
                    lock_script_hash: utxo.asset.lockScriptHash,
                    asset_type: utxo.asset.assetType
                })
            );
            const sum = utxoAssets.reduce(
                (amountSum, asset) => amountSum + asset.amount,
                0
            );

            if (sum === 0) {
                return console.log(`No asset is available`);
            }

            const recipient = await new List({
                message: "Who receives?",
                choices: addresses
            }).run();

            if (recipient === undefined) {
                return console.log("Recipient is not selected");
            }

            const transferAmount = Number.parseInt(
                await new Input({
                    message: "How much?"
                }).run(),
                10
            );

            if (transferAmount > sum) {
                return console.log("Impossible");
            }

            const tx = sdk.core.createAssetTransferTransaction();
            tx.addInputs(utxoAssets);
            tx.addOutputs({
                amount: transferAmount,
                assetType,
                recipient
            });
            if (sum - transferAmount > 0) {
                tx.addOutputs({
                    amount: sum - transferAmount,
                    assetType,
                    recipient: selectedAddress
                });
            }
            for (let i = 0; i < tx.inputs.length; i++) {
                await sdk.key.signTransactionInput(tx, i);
            }
            console.log(tx.inputs.map(i => i.prevOut.amount));
            console.log(tx.outputs.map(o => o.amount));

            try {
                await sendTransaction(tx);
                console.log("sent");
            } catch (e) {
                console.error(e);
            }

            break;
        default:
            console.info(`Unexpected answer: ${answer}`);
            break;
    }
}

function sendTransaction(tx: Transaction) {
    return fetch("http://localhost:4000/transaction", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ tx })
    }).then(r => {
        if (r.status >= 400) {
            return Promise.reject(Error(`${r.statusText}`));
        }
        return r.json();
    });
}

new Promise(async () => main()).catch(console.error);
