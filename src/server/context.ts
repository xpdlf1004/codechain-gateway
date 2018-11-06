import { CCKey } from "codechain-keystore";
import { SDK } from "codechain-sdk";
import { ServerConfig } from "./config";
import { DatabaseLowdbClient } from "./db-client";
import { IndexerClient } from "./indexer-client";

export interface ServerContext {
    config: ServerConfig;
    db: DatabaseLowdbClient;
    sdk: SDK;
    cckey: CCKey;
    indexer: IndexerClient;
}

export const createServerContext = async (
    config: ServerConfig
): Promise<ServerContext> => {
    return {
        config,
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
        cckey: await CCKey.create({ dbPath: config.keystorePath })
    };
};
