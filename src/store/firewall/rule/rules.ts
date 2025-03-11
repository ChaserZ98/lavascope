import { atom } from "jotai";
import { atomWithImmer } from "jotai-immer";

import { Version as IPVersion } from "@/store/ip";

import {
    CreateRule,
    NewRuleState,
    Protocol,
    ProtocolSelection,
    RuleState,
    SourceType,
} from "./types";

export function toProtocolDisplay(protocol: Protocol, port: string): string {
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

function toProtocol(protocol: ProtocolSelection): Protocol {
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

export function toCreateRule(newRuleState: NewRuleState): CreateRule {
    const protocol = toProtocol(newRuleState.protocol);
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
    isCreating: false,
};

export const initialNewRuleIPv6: NewRuleState = {
    ip_type: IPVersion.V6,
    protocol: "ssh",
    port: "22",
    sourceType: SourceType.ANYWHERE,
    source: "::/0",
    notes: "",
    isCreating: false,
};

export const rulesAtom = atomWithImmer<
    Record<string, Record<string, RuleState | undefined> | undefined>
>({});

export const setRuleIsDeletingAtom = atom(
    null,
    (_get, set, groupId: string, ruleId: string, isDeleting: boolean) => {
        set(rulesAtom, (state) => {
            if (!state[groupId]) return;
            if (!state[groupId][ruleId]) return;
            state[groupId][ruleId].isDeleting = isDeleting;
        });
    }
);

export const deleteRuleAtom = atom(
    null,
    (_get, set, groupId: string, ruleId: string) => {
        set(rulesAtom, (state) => {
            if (!state[groupId]) return;
            delete state[groupId][ruleId];
        });
    }
);
