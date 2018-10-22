import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as morgan from "morgan";

import * as lowdb from "lowdb";
import * as FileAsync from "lowdb/adapters/FileAsync";

import { SDK } from "codechain-sdk";
import { AssetTransferTransaction } from "codechain-sdk/lib/core/classes";

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

const runWebServer = (context: ServerContext, useCors = false) => {
    const app = express();
    const port = process.env.PORT || 3000;

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
        sdk: new SDK({ server: config.rpcHttp, networkId: "tc" }),
        // FIXME: Extract the address and passphrase to the config file or environment variables
        platformAddress: "tccq9wp2p6655qrjfvlw80g9rl5klg84y3emu2vd00s",
        passphrase: "test password"
    };
    await context.db.defaults({ counter: 0 }).write();
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
