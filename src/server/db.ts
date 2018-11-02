import * as lowdb from "lowdb";
import * as FileAsync from "lowdb/adapters/FileAsync";

export const createDb = async (path: string) => {
    const adapter = new FileAsync(path);
    return lowdb(adapter);
};
