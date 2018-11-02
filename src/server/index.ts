import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as lowdb from "lowdb";
import * as FileAsync from "lowdb/adapters/FileAsync";
import * as morgan from "morgan";

import { CCKey } from "codechain-keystore";
import { SDK } from "codechain-sdk";
import { AssetTransferTransaction } from "codechain-sdk/lib/core/classes";

import { MintTransactionInputGroupValue } from "../common/types/transactions";

const corsOptions = {
    origin: true,
    credentials: true,
    exposedHeaders: ["Location", "Link"]
};

interface ServerConfig {
    dbPath: string;
    rpcHttp: string;
}

interface ServerContext {
    db: lowdb.LowdbAsync<any>;
    sdk: SDK;
    platformAddress: string;
    passphrase: string;
}

const config: ServerConfig = {
    dbPath: "db.json",
    // FIXME: Use a valid rpc url
    rpcHttp: "http://52.79.108.1:8080"
};

const createDb = async () => {
    const adapter = new FileAsync(config.dbPath);
    return lowdb(adapter);
};

const runWebServer = async (context: ServerContext, useCors = false) => {
    const app = express();
    const port = process.env.PORT || 4000;
    const cckey = await CCKey.create({ dbPath: "keystore.db" });

    app.use(morgan("dev"));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    if (useCors) {
        app.options("*", cors(corsOptions)).use(cors(corsOptions));
    }

    app.post("/send_asset", async (req, res, next) => {
        const { tx } = req.body;
        try {
            const keyStore = await context.sdk.key.createLocalKeyStore();
            const platformAddress = context.platformAddress;
            const platformPassphrase = context.passphrase;
            const nonce = await context.sdk.rpc.chain.getNonce(platformAddress);
            const parcel = context.sdk.core.createAssetTransactionGroupParcel({
                transactions: [AssetTransferTransaction.fromJSON(tx)]
            });
            const signedParcel = await context.sdk.key.signParcel(parcel, {
                account: platformAddress,
                keyStore,
                fee: 10,
                nonce,
                passphrase: platformPassphrase
            });
            await context.sdk.rpc.chain.sendSignedParcel(signedParcel);
            // FIXME: Use a valid protocal format
            res.json("success");
        } catch (e) {
            res.sendStatus(500).send(e.message);
        }
    });

    app.get("/account/list", async (req, res, next) => {
        const keys = await cckey.platform.getKeys();
        const accounts = keys.map(k =>
            context.sdk.core.classes.PlatformAddress.fromAccountId(k).toString()
        );
        res.json({ accounts });
    });

    app.post("/account/new", async (req, res) => {
        context.sdk.key
            .createPlatformAddress()
            .then(address => {
                res.status(200).json(address.toString());
            })
            .catch(_ => {
                res.status(500).send();
            });
    });

    app.get("/account/:address", async (req, res) => {
        const { address } = req.params;
        if (!context.sdk.core.classes.PlatformAddress.check(address)) {
            return res.status(400).send();
        }
        try {
            const balance = await context.sdk.rpc.chain.getBalance(address);
            // FIXME: seq
            const nonce = await context.sdk.rpc.chain.getNonce(address);
            res.json({
                balance: balance.toString(),
                seq: nonce.toString()
            });
        } catch (e) {
            res.status(500).send();
        }
        return;
    });

    app.delete("/account/:address", async (req, res) => {
        const { address } = req.params;
        try {
            const accountId = context.sdk.core.classes.PlatformAddress.fromString(
                address
            ).getAccountId().value;
            cckey.platform
                .deleteKey({ key: accountId })
                .then(() => res.status(200).send())
                .catch(_ => res.status(500).send());
        } catch (e) {
            res.status(400).send();
        }
    });

    app.post("/transaction/mint", async (req, res) => {
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

    app.get("/asset/list", async (req, res) => {
        res.status(200).json(context.db.get("assets").value());
    });

    app.use((req, res, next) => {
        res.status(404).send("Not Found");
    });

    app.listen(port, () => {
        console.log(`Express server listening on port ${port}`);
    });
};

async function main() {
    const context: ServerContext = {
        db: await createDb(),
        // FIXME: Extract networkId to the config file or environment variables
        sdk: new SDK({
            server: config.rpcHttp,
            networkId: "tc",
            keyStoreType: {
                type: "local",
                path: "keystore.db"
            }
        }),
        // FIXME: Extract the address and passphrase to the config file or environment variables
        platformAddress: "tccq9wp2p6655qrjfvlw80g9rl5klg84y3emu2vd00s",
        passphrase: "test password"
    };
    await context.db.defaults({ counter: 0, assets: [] }).write();
    try {
        await context.sdk.rpc.node.ping();
        console.log("CodeChain node connected successfully");
    } catch (e) {
        console.error(e);
        process.exit(0);
    }
    runWebServer(context, true);
}

main();
