import { atom } from "jotai";
import { atomWithImmer } from "jotai-immer";

import { Version } from "@/store/ip";

import {
    initialNewRuleIPv4,
    initialNewRuleIPv6,
    type NewRuleState,
} from "../rule";
import { GroupState } from "./types";

export const groupsStateAtom = atomWithImmer<Record<string, GroupState>>({});

export const setNewRuleAtom = atom(
    null,
    (_get, set, groupId: string, rule: NewRuleState) => {
        const version = rule.ip_type;
        set(groupsStateAtom, (state) => {
            state[groupId].newRule[version] = rule;
        });
    }
);

export const resetNewRuleAtom = atom(
    null,
    (_get, set, groupId: string, version: Version) => {
        set(groupsStateAtom, (state) => {
            state[groupId].newRule[version] =
                version === Version.V4
                    ? initialNewRuleIPv4
                    : initialNewRuleIPv6;
        });
    }
);

export const setNewRuleIsCreatingAtom = atom(
    null,
    (_get, set, groupId: string, version: Version, isCreating: boolean) => {
        set(groupsStateAtom, (state) => {
            if (!state[groupId]?.newRule[version]) return;
            state[groupId].newRule[version].isCreating = isCreating;
        });
    }
);

export const setNewDescriptionAtom = atom(
    null,
    (_get, set, groupId: string, description: string) => {
        set(groupsStateAtom, (state) => {
            state[groupId].newDescription = description;
        });
    }
);

export const setGroupIsUpdatingAtom = atom(
    null,
    (_get, set, groupId: string, isLoading: boolean) => {
        set(groupsStateAtom, (state) => {
            if (!state[groupId]) return;
            state[groupId].isUpdating = isLoading;
        });
    }
);

export const setGroupIsDeletingAtom = atom(
    null,
    (_get, set, groupId: string, isLoading: boolean) => {
        set(groupsStateAtom, (state) => {
            if (!state[groupId]) return;
            state[groupId].isDeleting = isLoading;
        });
    }
);
