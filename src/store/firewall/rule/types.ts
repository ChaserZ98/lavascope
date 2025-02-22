import { Version as IPVersion } from "@/store/ip";

export enum Protocol {
    ICMP = "icmp",
    TCP = "tcp",
    UDP = "udp",
    GRE = "gre",
    ESP = "esp",
    AH = "ah",
}

export enum SourceType {
    MY_IP = "my ip",
    CUSTOM = "custom",
    ANYWHERE = "anywhere",
    CLOUDFLARE = "cloudflare",
    LOAD_BALANCER = "load balancer",
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

export type Rule = {
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

export type RuleState = {
    rule: Rule;
    deleting: boolean;
};
