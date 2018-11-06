import { CCKey } from "codechain-keystore";
import { SDK } from "codechain-sdk";
import { ServerConfig } from "./config";
import { DatabaseLowdbClient } from "./db-client";
import { IndexerClient } from "./indexer-client";

export interface ServerContext {
    db: DatabaseLowdbClient;
    sdk: SDK;
    cckey: CCKey;
    indexer: IndexerClient;
    platformAddress: string;
    passphrase: string;
}

export const createServerContext = async (config: ServerConfig) => {
    return {
        db: await DatabaseLowdbClient.create(config.dbPath),
        // FIXME: Extract networkId to the config file or environment variables
        sdk: new SDK({
            server: config.rpcHttp,
            networkId: "tc",
            keyStoreType: {
                type: "local",
                path: config.keystorePath
            }
        }),
        indexer: new IndexerClient("https://husky.codechain.io/explorer/api/"),
        cckey: await CCKey.create({ dbPath: config.keystorePath }),
        // FIXME: Extract the address and passphrase to the config file or environment variables
        platformAddress: "tccq9wp2p6655qrjfvlw80g9rl5klg84y3emu2vd00s",
        passphrase: "test password"
    };
};
