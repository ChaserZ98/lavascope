import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

import { Version as IPVersion } from "../ip";
import { firewallAtom } from "./firewall";
import {
    initialNewRuleIPv4,
    initialNewRuleIPv6,
    NewRuleState,
    RulesMeta,
    RuleState,
} from "./rules";

const endpoint = new URL("https://api.vultr.com/v2/firewalls");

export type GroupInfo = {
    id: string;
    description: string;
    date_created: string;
    date_modified: string;
    instance_count: number;
    rule_count: number;
    max_rule_count: number;
};

const initialGroupInfo = {
    id: "",
    description: "",
    date_created: "",
    date_modified: "",
    instance_count: 0,
    rule_count: 0,
    max_rule_count: 0,
};

export type GroupState = GroupInfo & {
    deleting: boolean;
    refreshing: boolean;
    newRule: Record<IPVersion, NewRuleState>;
    rules: Record<number, RuleState>;
    meta: RulesMeta | undefined | null;
};

export const initialGroupState: GroupState = {
    ...initialGroupInfo,
    deleting: false,
    refreshing: false,
    newRule: {
        [IPVersion.V4]: initialNewRuleIPv4,
        [IPVersion.V6]: initialNewRuleIPv6,
    },
    rules: {},
    meta: undefined,
};

export type GroupsMeta = {
    links: {
        prev: string;
        next: string;
    };
    total: number;
};

export const refreshGroupsAPI = (
    apiToken: string,
    fetchClient: typeof fetch,
    timeoutSignal: AbortSignal
) => {
    return fetchClient(endpoint, {
        method: "GET",
        headers: { Authorization: `Bearer ${apiToken}` },
        signal: timeoutSignal,
    });
};

export const deleteGroupAPI = (
    id: string,
    apiToken: string,
    fetchClient: typeof fetch,
    timeoutSignal: AbortSignal
) => {
    return fetchClient(new URL(`${endpoint}/${id}`), {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${apiToken}`,
        },
        signal: timeoutSignal,
    });
};

export const groupsAtom = atom((get) => get(firewallAtom).groups);

export const groupAtom = atomFamily((id: string) =>
    atom((get) => get(firewallAtom).groups[id])
);
