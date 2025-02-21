import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { atomWithImmer } from "jotai-immer";

export type FirewallState = {
    shouldUpdateFromDB: boolean;
    refreshing: boolean;
};

export const firewallAtom = atomWithImmer<FirewallState>({
    shouldUpdateFromDB: true,
    refreshing: false,
});

export const apiTokenAtom = atomWithStorage("apiToken", "", undefined, {
    getOnInit: true,
});

export const refreshingAtom = atom((get) => get(firewallAtom).refreshing);

export const shouldUpdateFromDBAtom = atom(
    (get) => get(firewallAtom).shouldUpdateFromDB
);
