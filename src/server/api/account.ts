import * as express from "express";

import { ServerContext } from "..";

export const createAccountApiRouter = (context: ServerContext) => {
    const router = express.Router();

    router.get("/list", async (_, res) => {
        const keys = await context.cckey.platform.getKeys();
        const accounts = keys.map(k =>
            context.sdk.core.classes.PlatformAddress.fromAccountId(k).toString()
        );
        res.json({ accounts });
    });

    router.post("/new", (_, res) => {
        context.sdk.key
            .createPlatformAddress()
            .then(address => {
                res.status(200).json(address.toString());
            })
            .catch(() => {
                res.status(500).send();
            });
    });

    router.get("/:address", async (req, res) => {
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

    router.delete("/:address", async (req, res) => {
        const { address } = req.params;
        try {
            const accountId = context.sdk.core.classes.PlatformAddress.fromString(
                address
            ).getAccountId().value;
            context.cckey.platform
                .deleteKey({ key: accountId })
                .then(() => res.status(200).send())
                .catch(_ => res.status(500).send());
        } catch (e) {
            res.status(400).send();
        }
    });

    return router;
};
