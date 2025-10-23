export type RequestType =
    | "GET"
    | "POST"
    | "PUT"
    | "DELETE"
    | "PATCH"
    | "OPTIONS";

export type Endpoint = {
    url: string;
    requestType: RequestType;
    apiKeyRequired: boolean;
    parameters?: Parameters;
};

export type Parameter = {
    type: string;
    required?: boolean;
    path?: boolean;
};

export type Parameters = Record<string, Parameter>;

export type IParams = Record<string, unknown>;

export interface IVultrAPI {
    apiToken: string;
    fetchClient: typeof fetch;
    baseUrl: string;
    timeout: number;
}

export interface IFirewallGroup {
    id: string;
    description: string;
    date_created: string;
    date_modified: string;
    instance_count: number;
    rule_count: number;
    max_rule_count: number;
}

export interface IMeta {
    total: number;
    links: {
        next: string;
        prev: string;
    };
}

export interface IFirewallRule {
    id: number;
    ip_type: "v4" | "v6";
    action: "accept" | "drop";
    protocol: "icmp" | "tcp" | "udp" | "gre" | "esp" | "ah";
    port: string;
    subnet: string;
    subnet_size: number;
    source: "" | "cloudflare";
    notes: string;
}

export type LoadBalancerId = string;

export interface IFirewallCreateRule {
    ip_type: "v4" | "v6";
    protocol: "icmp" | "tcp" | "udp" | "gre" | "esp" | "ah";
    subnet: string;
    subnet_size: number;
    port?: string;
    source?: "" | "cloudflare" | LoadBalancerId;
    notes?: string;
}
