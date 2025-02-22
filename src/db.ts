import Dexie, { Table } from "dexie";

import { Group, Rule } from "./store/firewall";
import { Version as IPVersion } from "./store/ip";

const db = new Dexie("vfw") as Dexie & {
    groups: Table<Group, string>;
    rules: Table<
        Rule & {
            group_id: string;
        },
        [string, number]
    >;
    endpoints: Table<{ ip_type: IPVersion; endpoint: string }, number>;
    endpointFlag: Table<{ ip_type: IPVersion }, IPVersion>;
};

db.version(1).stores({
    groups: "id",
    rules: "[group_id+id]",
    endpoints: "++id, ip_type, endpoint",
    endpointFlag: "ip_type",
});

export { db };
