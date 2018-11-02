export interface ServerConfig {
    dbPath: string;
    keystorePath: string;
    rpcHttp: string;
}

export const getDefaultServerConfig = () => ({
    dbPath: "db.json",
    keystorePath: "keystore.db",
    // FIXME: Use a valid rpc url
    rpcHttp: "http://52.79.108.1:8080"
});
