import type {
    Endpoint,
    IFirewallCreateRule,
    IFirewallGroup,
    IFirewallRule,
    IMeta,
    IParams,
} from "../types";

export const listGroups: Endpoint = {
    url: "/firewalls",
    requestType: "GET",
    apiKeyRequired: true,
    parameters: {
        per_page: {
            type: "string",
        },
        page: {
            type: "string",
        },
    },
};
export interface IListGroupsParams extends IParams {
    per_page?: string;
    page?: string;
}
export interface IListGroupsResponse {
    firewall_groups: IFirewallGroup[];
    meta: IMeta;
}

export const createGroup: Endpoint = {
    url: "/firewalls",
    requestType: "POST",
    apiKeyRequired: true,
    parameters: {
        description: { type: "string" },
    },
};
export interface ICreateGroupParams extends IParams {
    description: string;
}
export interface ICreateGroupResponse {
    firewall_group: IFirewallGroup;
}

export const getGroup: Endpoint = {
    url: "/firewalls/{firewall-group-id}",
    requestType: "GET",
    apiKeyRequired: true,
    parameters: {
        "firewall-group-id": {
            type: "string",
            path: true,
            required: true,
        },
    },
};
export interface IGetGroupParams extends IParams {
    "firewall-group-id": string;
}
export interface IGetGroupResponse {
    firewall_group: IFirewallGroup;
}

export const updateGroup: Endpoint = {
    url: "/firewalls/{firewall-group-id}",
    requestType: "PUT",
    apiKeyRequired: true,
    parameters: {
        "firewall-group-id": {
            type: "string",
            path: true,
            required: true,
        },
        description: {
            type: "string",
            required: true,
        },
    },
};
export interface IUpdateGroupParams extends IParams {
    "firewall-group-id": string;
    description: string;
}

export const deleteGroup: Endpoint = {
    url: "/firewalls/{firewall-group-id}",
    requestType: "DELETE",
    apiKeyRequired: true,
    parameters: {
        "firewall-group-id": {
            type: "string",
            path: true,
            required: true,
        },
    },
};
export interface IDeleteGroupParams extends IParams {
    "firewall-group-id": string;
}

export const listRules: Endpoint = {
    url: "/firewalls/{firewall-group-id}/rules",
    requestType: "GET",
    apiKeyRequired: true,
    parameters: {
        "firewall-group-id": {
            type: "string",
            path: true,
            required: true,
        },
    },
};
export interface IListRulesParams extends IParams {
    "firewall-group-id": string;
}
export interface IListRulesResponse {
    firewall_rules: IFirewallRule[];
    meta: IMeta;
}

export const createRule: Endpoint = {
    url: "/firewalls/{firewall-group-id}/rules",
    requestType: "POST",
    apiKeyRequired: true,
    parameters: {
        "firewall-group-id": {
            type: "string",
            path: true,
            required: true,
        },
        ip_type: {
            type: "string",
            required: true,
        },
        protocol: {
            type: "string",
            required: true,
        },
        subnet: {
            type: "string",
            required: true,
        },
        subnet_size: {
            type: "number",
            required: true,
        },
        port: { type: "string" },
        source: { type: "string" },
        notes: { type: "string" },
    },
};
export interface ICreateRuleParams extends IParams, IFirewallCreateRule {
    "firewall-group-id": string;
}
export interface ICreateRuleResponse {
    firewall_rule: IFirewallRule;
}

export const deleteRule: Endpoint = {
    url: "/firewalls/{firewall-group-id}/rules/{firewall-rule-id}",
    requestType: "DELETE",
    apiKeyRequired: true,
    parameters: {
        "firewall-group-id": {
            type: "string",
            path: true,
            required: true,
        },
        "firewall-rule-id": {
            type: "string",
            path: true,
            required: true,
        },
    },
};
export interface IDeleteRuleParams extends IParams {
    "firewall-group-id": string;
    "firewall-rule-id": string;
}

export const getRule: Endpoint = {
    url: "/firewalls/{firewall-group-id}/rules/{firewall-rule-id}",
    requestType: "GET",
    apiKeyRequired: true,
    parameters: {
        "firewall-group-id": {
            type: "string",
            path: true,
            required: true,
        },
        "firewall-rule-id": {
            type: "string",
            path: true,
            required: true,
        },
    },
};
export interface IGetRuleParams extends IParams {
    "firewall-group-id": string;
    "firewall-rule-id": string;
}
export interface IGetRuleResponse {
    firewall_rule: IFirewallRule;
}

export default {
    listGroups,
    createGroup,
    getGroup,
    updateGroup,
    deleteGroup,
    listRules,
    createRule,
    deleteRule,
    getRule,
};
