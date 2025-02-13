import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { toast } from "react-toastify";

import logging from "@/utils/log";

import { Version as IPVersion } from "../ip";
import { firewallAtom } from "./firewall";

const endpoint = (groupId: string, ruleId?: number) =>
    new URL(
        `https://api.vultr.com/v2/firewalls/${groupId}/rules${
            ruleId ? `/${ruleId}` : ""
        }`
    );

export enum Protocol {
    ICMP = "icmp",
    TCP = "tcp",
    UDP = "udp",
    GRE = "gre",
    ESP = "esp",
    AH = "ah",
}

export type ProtocolSelection =
    | "ssh"
    | "http"
    | "https"
    | "http3"
    | "mysql"
    | "postgresql"
    | "dns-udp"
    | "dns-tcp"
    | "ms-rdp"
    | Protocol;

export enum SourceType {
    MY_IP = "my ip",
    CUSTOM = "custom",
    ANYWHERE = "anywhere",
    CLOUDFLARE = "cloudflare",
    LOAD_BALANCER = "load balancer",
}

export type RuleInfo = {
    id: number;
    ip_type: IPVersion;
    action: "accept" | "drop";
    protocol: Protocol;
    port: string;
    subnet: string;
    subnet_size: number;
    source: "" | "cloudflare" | string;
    notes: string;
};

export type CreateRule = {
    ip_type: IPVersion;
    protocol: Protocol;
    port: string;
    subnet: string;
    subnet_size: number;
    source: "" | "cloudflare" | string;
    notes: string;
};

export type NewRuleState = {
    ip_type: IPVersion;
    protocol: ProtocolSelection;
    port: string;
    sourceType: SourceType;
    source: string;
    notes: string;
    creating: boolean;
};

export type RuleState = RuleInfo & {
    deleting: boolean;
};

export type RulesMeta = {
    total: number;
    links: {
        prev: string;
        next: string;
    };
};

export type RulesAction = {
    setNewRule: (groupId: string, rule: NewRuleState) => void;
    refreshRules: (
        id: string,
        apiToken: string,
        fetchClient: typeof fetch,
        timeout?: number
    ) => void;
    deleteRuleById: (
        group_id: string,
        rule_id: number,
        apiToken: string,
        fetchClient: typeof fetch,
        timeout?: number
    ) => Promise<void>;
    createRule: (
        groupId: string,
        newRule: CreateRule,
        apiToken: string,
        fetchClient: typeof fetch,
        timeout?: number
    ) => void;
};

export function protocolPortToDisplayProtocol(
    protocol: Protocol,
    port: string
): string {
    if (port === "53") return "DNS";
    if (protocol === Protocol.TCP) {
        switch (port) {
            case "22":
                return "SSH";
            case "80":
                return "HTTP";
            case "443":
                return "HTTPS";
            case "3306":
                return "MySQL";
            case "5432":
                return "PostgreSQL";
            case "3389":
                return "MS RDP";
            default:
                return Protocol.TCP.toUpperCase();
        }
    }
    if (protocol === Protocol.UDP) {
        switch (port) {
            case "443":
                return "HTTP3";
            default:
                return Protocol.UDP.toUpperCase();
        }
    }
    return protocol.toUpperCase();
}

function toRuleProtocol(protocol: ProtocolSelection): Protocol {
    switch (protocol) {
        case "ssh":
            return Protocol.TCP;
        case "http":
            return Protocol.TCP;
        case "https":
            return Protocol.TCP;
        case "http3":
            return Protocol.UDP;
        case "mysql":
            return Protocol.TCP;
        case "postgresql":
            return Protocol.TCP;
        case "dns-udp":
            return Protocol.UDP;
        case "dns-tcp":
            return Protocol.TCP;
        case "ms-rdp":
            return Protocol.TCP;
        default:
            return protocol;
    }
}

export function newRuleStateToCreateRule(
    newRuleState: NewRuleState
): CreateRule {
    const protocol = toRuleProtocol(newRuleState.protocol);
    let subnet = "";
    let subnet_size = 0;
    const source =
        newRuleState.sourceType === SourceType.CLOUDFLARE
            ? "cloudflare"
            : newRuleState.sourceType === SourceType.LOAD_BALANCER
              ? "load balancer"
              : "";
    if (
        newRuleState.sourceType === SourceType.CLOUDFLARE ||
        newRuleState.sourceType === SourceType.LOAD_BALANCER
    ) {
        subnet = "";
        subnet_size = 0;
    } else {
        const s = newRuleState.source.split("/");
        if (s.length == 1) {
            subnet = s[0];
            subnet_size = newRuleState.ip_type === IPVersion.V4 ? 32 : 128;
        } else if (isNaN(parseInt(s[1]))) {
            throw new Error(`Invalid subnet size: ${s[1]}`);
        } else {
            subnet = s[0];
            subnet_size = parseInt(s[1]);
        }
    }
    return {
        ip_type: newRuleState.ip_type,
        protocol,
        port: newRuleState.port,
        subnet,
        subnet_size,
        source,
        notes: newRuleState.notes,
    };
}

export const initialNewRuleIPv4: NewRuleState = {
    ip_type: IPVersion.V4,
    protocol: "ssh",
    port: "22",
    sourceType: SourceType.ANYWHERE,
    source: "0.0.0.0/0",
    notes: "",
    creating: false,
};

export const initialNewRuleIPv6: NewRuleState = {
    ip_type: IPVersion.V6,
    protocol: "ssh",
    port: "22",
    sourceType: SourceType.ANYWHERE,
    source: "::/0",
    notes: "",
    creating: false,
};

export const rulesAtom = atomFamily((id: string) =>
    atom((get) => get(firewallAtom).groups[id]?.rules)
);
export const refreshingAtom = atomFamily((id: string) =>
    atom((get) => get(firewallAtom).groups[id]?.refreshing)
);

export const refreshRulesAtom = atom(
    null,
    (
        _get,
        set,
        id: string,
        apiToken: string,
        fetchClient: typeof fetch,
        timeout: number = 5000
    ) => {
        logging.info(`Fetching rules for group ${id}.`);
        set(firewallAtom, (state) => {
            state.groups[id].refreshing = true;
        });
        const timeoutSignal = AbortSignal.timeout(timeout);
        fetchClient(endpoint(id), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
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
                    const {
                        firewall_rules,
                        meta,
                    }: { firewall_rules: RuleInfo[]; meta: RulesMeta } =
                        res.data;
                    logging.info(
                        `Successfully fetched ${meta.total} rules for group ${id}.`
                    );
                    set(firewallAtom, (state) => {
                        state.groups[id].meta = meta;
                        state.groups[id].rules = firewall_rules.reduce(
                            (acc, rule) => {
                                acc[rule.id] = {
                                    ...rule,
                                    deleting: false,
                                };
                                return acc;
                            },
                            {} as Record<number, RuleState>
                        );
                    });
                } else if (res.status < 500)
                    throw new Error(
                        `${res.status} ${
                            res.data.error ? res.data.error : res.statusText
                        }`
                    );
                else throw new Error(`${res.status} ${res.statusText}`);
            })
            .catch((err: Error) => {
                logging.error(
                    `Failed to fetch firewall rules for group ${id}: ${
                        timeoutSignal.aborted ? timeoutSignal.reason : err
                    }`
                );
                toast.error(
                    `Failed to fetch firewall rules for group ${id}: ${
                        timeoutSignal.aborted
                            ? timeoutSignal.reason.message
                            : err.message
                    }`
                );
                set(firewallAtom, (state) => {
                    state.groups[id].rules = {};
                    state.groups[id].meta = null;
                });
            })
            .finally(() =>
                set(firewallAtom, (state) => {
                    state.groups[id].refreshing = false;
                })
            );
    }
);

export const deleteRuleByIdAtom = atom(
    null,
    async (
        _get,
        set,
        groupId: string,
        ruleId: number,
        apiToken: string,
        fetchClient: typeof fetch,
        timeout: number = 5000
    ) => {
        logging.info(`Deleting the rule ${ruleId} in group ${groupId}.`);
        set(firewallAtom, (state) => {
            state.groups[groupId].rules[ruleId].deleting = true;
        });

        const timeoutSignal = AbortSignal.timeout(timeout);

        await fetchClient(endpoint(groupId, ruleId), {
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
                        `${res.status} ${
                            data.error ? data.error : res.statusText
                        }`
                    );
                }
                set(firewallAtom, (state) => {
                    delete state.groups[groupId].rules[ruleId];
                });
                logging.info(
                    `Successfully deleted the rule ${ruleId} in group ${groupId}.`
                );
                toast.success(`Successfully deleted the rule.`);
            })
            .catch((err: Error) => {
                logging.error(
                    `Failed to delete firewall rule ${ruleId} in group ${groupId}: ${
                        timeoutSignal.aborted ? timeoutSignal.reason : err
                    }`
                );
                toast.error(
                    `Failed to delete the firewall rule: ${
                        timeoutSignal.aborted
                            ? timeoutSignal.reason.message
                            : err.message
                    }`
                );
                set(firewallAtom, (state) => {
                    state.groups[groupId].rules[ruleId].deleting = false;
                });
            });
    }
);

export const createRuleAtom = atom(
    null,
    (
        _get,
        set,
        groupId: string,
        newRule: CreateRule,
        apiToken: string,
        fetchClient: typeof fetch,
        timeout: number = 5000
    ) => {
        logging.info(
            `Creating a new rule ${JSON.stringify(
                newRule
            )} in group ${groupId}.`
        );
        set(firewallAtom, (state) => {
            state.groups[groupId].newRule[newRule.ip_type].creating = true;
        });

        const timeoutSignal = AbortSignal.timeout(timeout);
        fetchClient(endpoint(groupId), {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newRule),
            signal: timeoutSignal,
        })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(
                        `${res.status} ${
                            data.error ? data.error : res.statusText
                        }`
                    );
                }
                logging.info(
                    `Successfully created the rule ${JSON.stringify(
                        data
                    )} in group ${groupId}.`
                );
                toast.success("Successfully created the rule.");

                const rule = data.firewall_rule as RuleInfo;
                set(firewallAtom, (state) => {
                    state.groups[groupId].rules[rule.id] = {
                        ...rule,
                        deleting: false,
                    };
                    state.groups[groupId].newRule[newRule.ip_type] =
                        newRule.ip_type === IPVersion.V4
                            ? initialNewRuleIPv4
                            : initialNewRuleIPv6;
                });
            })
            .catch((err: Error) => {
                logging.error(
                    `Failed to create the rule ${JSON.stringify(
                        newRule
                    )} in group ${groupId}: ${
                        timeoutSignal.aborted ? timeoutSignal.reason : err
                    }`
                );
                toast.error(
                    `Failed to create the rule: ${
                        timeoutSignal.aborted
                            ? timeoutSignal.reason.message
                            : err.message
                    }`
                );
                set(firewallAtom, (state) => {
                    state.groups[groupId].newRule[newRule.ip_type].creating =
                        false;
                });
            });
    }
);

export const setNewRuleAtom = atom(
    null,
    (_get, set, groupId: string, rule: NewRuleState) => {
        set(firewallAtom, (state) => {
            state.groups[groupId].newRule[rule.ip_type] = rule;
        });
    }
);
