import { atomWithStorage } from "jotai/utils";

export const apiTokenAtom = atomWithStorage("apiToken", "", undefined, {
    getOnInit: true,
});
