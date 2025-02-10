import { atom } from "jotai";
import { atomWithImmer } from "jotai-immer";
import { type GroupState, type GroupsMeta } from "./groups";

export type FirewallState = {
    groups: Record<string, GroupState>;
    meta: GroupsMeta | undefined | null; // undefined -> not fetched, null -> failed to fetch
    refreshing: boolean;
};

const initialState: FirewallState = {
    groups: {},
    meta: undefined,
    refreshing: false,
};

export const firewallAtom = atomWithImmer(initialState);

export const refreshingAtom = atom((get) => get(firewallAtom).refreshing);
