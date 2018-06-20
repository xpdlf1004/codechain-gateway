import * as express from "express";
import * as morgan from "morgan";
import * as bodyParser from "body-parser";

import * as lowdb from "lowdb";
import * as FileAsync from "lowdb/adapters/FileAsync"

interface ServerConfig {
    dbPath: string;
}

interface ServerContext {
    db: lowdb.LowdbAsync<any>;
}

const config: ServerConfig = {
    dbPath: "db.json",
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
    app.use("/", async (req, res, next) => {
        await context.db.update("counter", n => n + 1).write();
        res.send("Hello, world!");
    });

    app.use((req, res, next) => {
        res.status(404).send("Not Found");
    });

    app.listen(3000, function() {
        console.log('Express server listening on port 3000');
    });
};

async function main() {
    const context: ServerContext = {
        db: await createDb(),
    }
    await context.db.defaults({ counter: 0 }).write();
    runWebServer(context);
}

main();
