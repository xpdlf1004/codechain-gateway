import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as lowdb from "lowdb";
import * as FileAsync from "lowdb/adapters/FileAsync";
import * as morgan from "morgan";

import { CCKey } from "codechain-keystore";
import { SDK } from "codechain-sdk";

import { createAccountApiRouter } from "./api/account";
import { createAssetApiRouter } from "./api/asset";
import { createTransactionApiRouter } from "./api/transaction";

const corsOptions = {
    origin: true,
    credentials: true,
    exposedHeaders: ["Location", "Link"]
};

interface ServerConfig {
    dbPath: string;
    keystorePath: string;
    rpcHttp: string;
}

export interface ServerContext {
    db: lowdb.LowdbAsync<any>;
    sdk: SDK;
    cckey: CCKey;
    platformAddress: string;
    passphrase: string;
}

const config: ServerConfig = {
    dbPath: "db.json",
    keystorePath: "keystore.db",
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

    app.use(morgan("dev"));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    if (useCors) {
        app.options("*", cors(corsOptions)).use(cors(corsOptions));
    }

    app.use("/send_asset", createTransactionApiRouter(context));
    app.use("/account", createAccountApiRouter(context));
    app.use("/asset", createAssetApiRouter(context));

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
                path: config.keystorePath
            }
        }),
        cckey: await CCKey.create({ dbPath: config.keystorePath }),
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
