import { Version as IPVersion } from "@lavascope/store";

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
    /**
     * True -> the group's create mutation is in progress.
     */
    isCreating: boolean;
};
