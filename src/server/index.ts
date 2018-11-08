import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import { renameSync } from "fs";
import * as morgan from "morgan";
import * as multer from "multer";

import { createAccountApiRouter } from "./api/account";
import { createAssetApiRouter } from "./api/asset";
import { createAssetAddressApiRouter } from "./api/asset-address";
import { createTransactionApiRouter } from "./api/transaction";
import { getDefaultServerConfig } from "./config";
import { createServerContext, ServerContext } from "./context";

const corsOptions = {
    origin: true,
    credentials: true,
    exposedHeaders: ["Location", "Link"]
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

    app.use("/transaction", createTransactionApiRouter(context));
    app.use("/account", createAccountApiRouter(context));
    app.use("/asset", createAssetApiRouter(context));
    app.use("/asset-address", createAssetAddressApiRouter(context));
    app.post(
        "/image",
        multer({ dest: "public/imgs" }).single("image"),
        (req, res) => {
            const { path, originalname } = req.file;
            const ext = originalname.split(".").pop();
            const newPath = `${path}.${ext}`;
            renameSync(path, newPath);
            res.status(200).json({
                // FIXME:
                url: `http://localhost:3000/imgs/${newPath.split("/").pop()}`
            });
        }
    );

    app.use((req, res, next) => {
        res.status(404).send("Not Found");
    });

    app.listen(port, () => {
        console.log(`Express server listening on port ${port}`);
    });
};

async function main() {
    const config = getDefaultServerConfig();
    const context = await createServerContext(config);
    try {
        await context.sdk.rpc.node.ping();
        console.log("CodeChain node connected successfully");
    } catch (e) {
        console.error(e);
        process.exit(0);
    }
    runWebServer(context, true);
}

process.on("unhandledRejection", err => {
    console.error("unhandledRejection", err);
});

main();
