import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { toast } from "react-toastify";

import logging from "@/utils/log";
import { Version as IPVersion } from "../ip";
import { firewallAtom } from "./firewall";
import {
    NewRuleState,
    RuleState,
    RulesMeta,
    initialNewRuleIPv4,
    initialNewRuleIPv6,
} from "./rules";

const endpoint = new URL("https://api.vultr.com/v2/firewalls");

type GroupInfo = {
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

export const groupsAtom = atom((get) => get(firewallAtom).groups);

export const groupAtom = atomFamily((id: string) =>
    atom((get) => get(firewallAtom).groups[id])
);

export const refreshGroupsAtom = atom(
    null,
    (
        _get,
        set,
        apiToken: string,
        fetchClient: typeof fetch,
        timeout: number = 5000
    ) => {
        logging.info(`Fetching firewall groups.`);
        set(firewallAtom, (state) => {
            state.refreshing = true;
        });

        const timeoutSignal = AbortSignal.timeout(timeout);
        fetchClient(endpoint, {
            method: "GET",
            headers: { Authorization: `Bearer ${apiToken}` },
            signal: timeoutSignal,
        })
            .then(async (res) => {
                return {
                    status: res.status,
                    statusText: res.statusText,
                    data: await res.json(),
                };
            })
            .then((res) => {
                if (res.status < 400) {
                    const firewall_groups: GroupInfo[] =
                        res.data.firewall_groups;
                    logging.info(
                        `Successfully fetched ${res.data.meta.total} firewall groups.`
                    );
                    set(firewallAtom, (state) => {
                        state.meta = res.data.meta;
                        state.groups = firewall_groups.reduce((acc, group) => {
                            acc[group.id] =
                                group.id in state.groups &&
                                state.groups[group.id].date_modified ===
                                    group.date_modified
                                    ? state.groups[group.id]
                                    : {
                                          ...initialGroupState,
                                          ...group,
                                      };
                            return acc;
                        }, {} as Record<string, GroupState>);
                    });
                } else if (res.status < 500)
                    throw new Error(
                        `${res.data.error ? res.data.error : res.statusText}`
                    );
                else throw new Error(`${res.status} ${res.statusText}`);
            })
            .catch((err: Error) => {
                if (timeoutSignal.aborted) {
                    logging.warn(
                        `Failed to fetch firewall groups: ${timeoutSignal.reason}`
                    );
                } else {
                    logging.error(`Failed to fetch firewall groups: ${err}`);
                }
                toast.error(
                    `Failed to fetch firewall groups: ${
                        timeoutSignal.aborted
                            ? timeoutSignal.reason.message
                            : err.message || err
                    }`
                );
                set(firewallAtom, (state) => {
                    state.groups = {};
                    state.meta = null;
                });
            })
            .finally(() =>
                set(firewallAtom, (state) => {
                    state.refreshing = false;
                })
            );
    }
);

export const deleteGroupByIdAtom = atom(
    null,
    (
        _get,
        set,
        id: string,
        apiToken: string,
        fetchClient: typeof fetch,
        timeout: number = 5000
    ) => {
        logging.info(`Deleting group with ID ${id}.`);
        set(firewallAtom, (state) => {
            state.groups[id].deleting = true;
        });
        const timeoutSignal = AbortSignal.timeout(timeout);
        fetchClient(new URL(`${endpoint}/${id}`), {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
            signal: timeoutSignal,
        })
            .then(async (res) => {
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(
                        `Failed to delete firewall group: ${res.status} ${
                            data.error ? data.error : res.statusText
                        }`
                    );
                }
                set(firewallAtom, (state) => {
                    delete state.groups[id];
                });
                logging.info(`Successfully deleted group with ID ${id}`);
                toast.success(`Successfully deleted group with ID ${id}`);
            })
            .catch((err: Error) => {
                if (timeoutSignal.aborted) {
                    logging.error(
                        `Failed to delete group: ${timeoutSignal.reason}`
                    );
                    toast.error(
                        `Failed to delete group: ${timeoutSignal.reason.message}`
                    );
                } else {
                    logging.error(`${err}`);
                    toast.error(err.message);
                }
                set(firewallAtom, (state) => {
                    state.groups[id].deleting = false;
                });
            });
    }
);
