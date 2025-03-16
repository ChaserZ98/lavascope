import { atomWithStorage } from "jotai/utils";

export const useProxyAtom = atomWithStorage("useProxy", false, undefined, {
    getOnInit: true,
});

export const proxyAddressAtom = atomWithStorage("proxyAddress", "", undefined, {
    getOnInit: true,
});
