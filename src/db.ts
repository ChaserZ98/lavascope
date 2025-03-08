import Dexie, { Table } from "dexie";

import { Group, Rule } from "./store/firewall";

const db = new Dexie("vfw") as Dexie & {
    groups: Table<Group, string>;
    rules: Table<
        Rule & {
            group_id: string;
        },
        [string, number]
    >;
};

db.version(1).stores({
    groups: "id",
    rules: "[group_id+id]",
    endpoints: "++id, ip_type, endpoint",
    endpointFlag: "ip_type",
});

export { db };
