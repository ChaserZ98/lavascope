import { atom } from "jotai";
import { atomWithImmer } from "jotai-immer";

import { Version as IPVersion } from "../../ip";
import {
    initialNewRuleIPv4,
    initialNewRuleIPv6,
    type NewRuleState,
} from "../rule";
import { GroupState } from "./types";

const initialGroupInfo = {
    id: "",
    description: "",
    date_created: "",
    date_modified: "",
    instance_count: 0,
    rule_count: 0,
    max_rule_count: 0,
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
