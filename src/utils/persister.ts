import {
    PersistedClient,
    Persister,
} from "@tanstack/react-query-persist-client";
import { del, get, set } from "idb-keyval";

export function createIDBPersister(idbValidKey: IDBValidKey = "reactQuery") {
    return {
        persistClient: async (client: PersistedClient) =>
            await set(idbValidKey, client),
        restoreClient: async () => await get<PersistedClient>(idbValidKey),
        removeClient: async () => await del(idbValidKey),
    } satisfies Persister;
}
