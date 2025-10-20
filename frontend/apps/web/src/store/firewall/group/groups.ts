import { Version } from "@lavascope/store";
import { produce } from "immer";
import { atom } from "jotai";

import {
    initialNewRuleIPv4,
    initialNewRuleIPv6,
    type NewRuleState,
} from "../rule";
import type { GroupState } from "./types";

export type GroupsState = Record<string, GroupState | undefined>;

export const groupsStateAtom = atom<
    GroupsState
>({});

export const addGroupStateAtom = atom(
    null,
    (_get, set, groupState: GroupState) => {
        set(groupsStateAtom, produce((draft) => {
            draft[groupState.group.id] = groupState;
        }));
    }
);

export const persistCreatingGroupAtom = atom(
    null,
    (_get, set, tempGroupId: string, groupState: GroupState) => {
        set(groupsStateAtom, produce((draft) => {
            if (draft[tempGroupId]) delete draft[tempGroupId];
            draft[groupState.group.id] = groupState;
        }));
    }
);

export const setNewRuleAtom = atom(
    null,
    (_get, set, groupId: string, rule: NewRuleState) => {
        const version = rule.ip_type;
        set(groupsStateAtom, produce((draft) => {
            if (!draft[groupId]) return;
            draft[groupId].newRule[version] = rule;
        }));
    }
);

export const resetNewRuleAtom = atom(
    null,
    (_get, set, groupId: string, version: Version) => {
        set(groupsStateAtom, produce((draft) => {
            if (!draft[groupId]) return;
            draft[groupId].newRule[version] =
                version === Version.V4 ?
                    initialNewRuleIPv4 :
                    initialNewRuleIPv6;
        }));
    }
);

export const setDescriptionAtom = atom(
    null,
    (_get, set, groupId: string, description: string) => {
        set(groupsStateAtom, produce((draft) => {
            if (!draft[groupId]) return;
            draft[groupId].group.description = description;
        }));
    }
);

export const setNewDescriptionAtom = atom(
    null,
    (_get, set, groupId: string, description: string) => {
        set(groupsStateAtom, produce((draft) => {
            if (!draft[groupId]) return;
            draft[groupId].newDescription = description;
        }));
    }
);

export const setGroupIsUpdatingAtom = atom(
    null,
    (_get, set, groupId: string, isLoading: boolean) => {
        set(groupsStateAtom, produce((draft) => {
            if (!draft[groupId]) return;
            draft[groupId].isUpdating = isLoading;
        }));
    }
);

export const setGroupIsDeletingAtom = atom(
    null,
    (_get, set, groupId: string, isLoading: boolean) => {
        set(groupsStateAtom, produce((draft) => {
            if (!draft[groupId]) return;
            draft[groupId].isDeleting = isLoading;
        }));
    }
);

export const deleteGroupStateAtom = atom(
    null,
    (_get, set, groupId: string) => {
        set(groupsStateAtom, produce((draft) => {
            if (!draft[groupId]) return;
            delete draft[groupId];
        }));
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
