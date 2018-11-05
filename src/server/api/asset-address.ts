import * as express from "express";

import { ServerContext } from "../context";

export const createAssetAddressApiRouter = (context: ServerContext) => {
    const router = express.Router();

    router.get("/list", async (_, res) => {
        const keys = await context.cckey.asset.getKeys();
        const addresses = keys.map(k =>
            context.sdk.core.classes.AssetTransferAddress.fromTypeAndPayload(
                1,
                k
            ).toString()
        );
        res.status(200).json({ addresses });
    });

    router.delete("/:address", (req, res) => {
        const { address } = req.params;
        try {
            const pubkeyhash = context.sdk.core.classes.AssetTransferAddress.fromString(
                address
            ).payload.value;
            context.cckey.asset
                .deleteKey({ key: pubkeyhash })
                .then(() => res.status(200).send())
                .catch(_ => res.status(500).send());
        } catch (e) {
            res.status(400).send();
        }
        res.status(200).json({});
    });

    return router;
};
