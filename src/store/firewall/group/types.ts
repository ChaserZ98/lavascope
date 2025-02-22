import { Version as IPVersion } from "@/store/ip";

import type { NewRuleState } from "../rule";

export type Group = {
    id: string;
    description: string;
    date_created: string;
    date_modified: string;
    instance_count: number;
    rule_count: number;
    max_rule_count: number;
};

export type GroupState = {
    group: Group;
    deleting: boolean;
    refreshing: boolean;
    shouldUpdateFromDB: boolean;
    isRulesOutdated: boolean;
    newRule: Record<IPVersion, NewRuleState>;
};
