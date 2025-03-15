import { atom } from "jotai";
import { atomWithImmer } from "jotai-immer";

import { Version } from "@/store/ip";

import {
    initialNewRuleIPv4,
    initialNewRuleIPv6,
    type NewRuleState,
} from "../rule";
import { GroupState } from "./types";

export type GroupsState = Record<string, GroupState | undefined>;

export const groupsStateAtom = atomWithImmer<
    GroupsState
>({});

export const addGroupStateAtom = atom(
    null,
    (_get, set, groupState: GroupState) => {
        set(groupsStateAtom, (state) => {
            state[groupState.group.id] = groupState;
        });
    }
);

export const persistCreatingGroupAtom = atom(
    null,
    (_get, set, tempGroupId: string, groupState: GroupState) => {
        set(groupsStateAtom, (state) => {
            if (state[tempGroupId]) delete state[tempGroupId];
            state[groupState.group.id] = groupState;
        });
    }
);

export const setNewRuleAtom = atom(
    null,
    (_get, set, groupId: string, rule: NewRuleState) => {
        const version = rule.ip_type;
        set(groupsStateAtom, (state) => {
            if (!state[groupId]) return;
            state[groupId].newRule[version] = rule;
        });
    }
);

export const resetNewRuleAtom = atom(
    null,
    (_get, set, groupId: string, version: Version) => {
        set(groupsStateAtom, (state) => {
            if (!state[groupId]) return;
            state[groupId].newRule[version] =
                version === Version.V4 ?
                    initialNewRuleIPv4 :
                    initialNewRuleIPv6;
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

export const setDescriptionAtom = atom(
    null,
    (_get, set, groupId: string, description: string) => {
        set(groupsStateAtom, (state) => {
            if (!state[groupId]) return;
            state[groupId].group.description = description;
        });
    }
);

export const setNewDescriptionAtom = atom(
    null,
    (_get, set, groupId: string, description: string) => {
        set(groupsStateAtom, (state) => {
            if (!state[groupId]) return;
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

export const deleteGroupStateAtom = atom(
    null,
    (_get, set, groupId: string) => {
        set(groupsStateAtom, (state) => {
            if (!state[groupId]) return;
            delete state[groupId];
        });
    }
);

export const getGroupDescriptionAtom = atom(
    null,
    (get, _set, groupId: string) => {
        const state = get(groupsStateAtom);
        return state[groupId]?.group.description ?? "";
    }
);

export const getCreatingGroupCountAtom = atom(
    null,
    (get) => {
        const state = get(groupsStateAtom);
        return Object.values(state).filter((group) => group?.isCreating).length;
    }
);
