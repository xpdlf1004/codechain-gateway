import * as bodyParser from "body-parser";
import * as express from "express";
import * as morgan from "morgan";

import * as lowdb from "lowdb";
import * as FileAsync from "lowdb/adapters/FileAsync";

import { SDK } from "codechain-sdk";

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
    const port = process.env.PORT || 3000;

    app.use(morgan("dev"));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.post("/send_asset", async (req, res, next) => {
        const { tx } = req.body;
        console.log(tx);
        res.sendStatus(200);
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
        sdk: new SDK({ server: config.rpcHttp }),
        secret:
            "ede1d4ccb4ec9a8bbbae9a13db3f4a7b56ea04189be86ac3a6a439d9a0a1addd"
    };
    await context.db.defaults({ counter: 0 }).write();
    try {
        await context.sdk.rpc.node.ping();
        console.log("CodeChain node connected successfully");
    } catch (e) {
        console.error(e);
        process.exit(0);
    }
    runWebServer(context);
}

main();
