import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { atomWithImmer } from "jotai-immer";

import { Version as IPVersion } from "../ip";
import { initialNewRuleIPv4, initialNewRuleIPv6, NewRuleState } from "./rules";

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

export type GroupState = {
    group: GroupInfo;
    deleting: boolean;
    refreshing: boolean;
    shouldUpdateFromDB: boolean;
    isRulesOutdated: boolean;
    newRule: Record<IPVersion, NewRuleState>;
};

export const initialGroupState: GroupState = {
    group: initialGroupInfo,
    deleting: false,
    refreshing: false,
    shouldUpdateFromDB: true,
    isRulesOutdated: false,
    newRule: {
        [IPVersion.V4]: initialNewRuleIPv4,
        [IPVersion.V6]: initialNewRuleIPv6,
    },
};

export const groupsAtom = atomWithImmer<Record<string, GroupState>>({});

export const groupAtom = atomFamily((id: string) =>
    atom((get) => get(groupsAtom)[id])
);

export const setNewRuleAtom = atom(
    null,
    (_get, set, groupId: string, rule: NewRuleState) => {
        set(groupsAtom, (state) => {
            if (state[groupId]) {
                state[groupId].newRule[rule.ip_type] = rule;
            }
        });
    }
);
