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
    group?: Group;
    newRule: Record<IPVersion, NewRuleState>;
    newDescription: string;
    /**
     * True -> the group's update mutation is in progress.
     */
    isUpdating: boolean;
    /**
     * True -> the group's delete mutation is in progress.
     */
    isDeleting: boolean;
};
