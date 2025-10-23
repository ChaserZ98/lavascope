import { atomWithStorage } from "jotai/utils";

export const apiTokenAtom = atomWithStorage("apiToken", "", undefined, {
    getOnInit: true,
});

export type FirewallState = {
    shouldUpdateFromDB: boolean;
    refreshing: boolean;
};
