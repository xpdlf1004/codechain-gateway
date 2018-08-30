import * as bodyParser from "body-parser";
import * as express from "express";
import * as morgan from "morgan";

import * as lowdb from "lowdb";
import * as FileAsync from "lowdb/adapters/FileAsync";

import { AssetMintTransaction, H160, H256, Parcel, SDK } from "codechain-sdk";

interface ServerConfig {
    dbPath: string;
    rpcHttp: string;
}

interface ServerContext {
    db: lowdb.LowdbAsync<any>;
    sdk: SDK;
    secret: string;
}

const config: ServerConfig = {
    dbPath: "db.json",
    rpcHttp: "http://localhost:8080"
};

const createDb = async () => {
    const adapter = new FileAsync(config.dbPath);
    return lowdb(adapter);
};

const runWebServer = (context: ServerContext) => {
    const app = express();

    app.use(morgan("dev"));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Router
    // FIXME: Authenticate
    app.post("/new_asset", async (req, res, next) => {
        const { registrar, amount, name, imageUrl, decimal } = req.body;
        if (typeof registrar === "string" && registrar.length !== 40) {
            return res.status(400).send("Invalid registrar");
        } else if (typeof amount !== "number" || amount < 0) {
            return res.status(400).send("Invalid amount");
        } else if (typeof name !== "string") {
            return res.status(400).send("Name must be given");
        } else if (
            typeof decimal === "number" &&
            (decimal < 0 || 18 < decimal)
        ) {
            return res.status(400).send("Invalid decimal");
        }
        // FIXME: get lockScriptHash and Parameters from a provider
        const mintTransaction = new AssetMintTransaction({
            metadata: JSON.stringify({ name, imageUrl, decimal }),
            amount,
            lockScriptHash: new H256(""),
            parameters: [],
            registrar: new H160(registrar),
            nonce: 0
        });
        res.sendStatus(501);
    });

    app.use((req, res, next) => {
        res.status(404).send("Not Found");
    });

    app.listen(3000, () => {
        console.log("Express server listening on port 3000");
    });
};

async function main() {
    const context: ServerContext = {
        db: await createDb(),
        sdk: new SDK(config.rpcHttp),
        secret:
            "ede1d4ccb4ec9a8bbbae9a13db3f4a7b56ea04189be86ac3a6a439d9a0a1addd"
    };
    await context.db.defaults({ counter: 0 }).write();
    try {
        const response = await context.sdk.ping();
        console.log("CodeChain node connected successfully");
    } catch (e) {
        console.error(e);
        process.exit(0);
    }
    runWebServer(context);
}

main();
