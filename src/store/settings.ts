import { atom } from "jotai";
import { atomWithImmer } from "jotai-immer";

import logging from "@/utils/log";

export type Settings = {
    proxyAddress: string;
    useProxy: boolean;
    apiToken: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isSettings(settings: any): settings is Settings {
    return (
        typeof settings.proxyAddress === "string" &&
        typeof settings.useProxy === "boolean" &&
        typeof settings.apiToken === "string"
    );
}

function createInitialSettings(): Settings {
    try {
        const settings = JSON.parse(localStorage.getItem("settings") || "{}");
        return isSettings(settings)
            ? settings
            : {
                  proxyAddress: "",
                  useProxy: false,
                  apiToken: "",
              };
    } catch (e) {
        logging.error(`Error parsing settings: ${e}`);
        return {
            proxyAddress: "",
            useProxy: false,
            apiToken: "",
        };
    }
}

export const settingsAtom = atomWithImmer(createInitialSettings());
export const setSettingsAtom = atom(null, (_get, set, settings: Settings) => {
    localStorage.setItem("settings", JSON.stringify(settings));
    set(settingsAtom, settings);
});

export const apiTokenAtom = atom(
    (get) => get(settingsAtom).apiToken,
    (_get, set, apiToken: string) => {
        set(settingsAtom, (state) => {
            state.apiToken = apiToken;
            localStorage.setItem("settings", JSON.stringify(state));
        });
    }
);
export const proxyAddressAtom = atom(
    (get) => get(settingsAtom).proxyAddress,
    (_get, set, proxyAddress: string) => {
        set(settingsAtom, (state) => {
            state.proxyAddress = proxyAddress;
            localStorage.setItem("settings", JSON.stringify(state));
        });
    }
);
export const useProxyAtom = atom(
    (get) => get(settingsAtom).useProxy,
    (_get, set, useProxy: boolean) => {
        set(settingsAtom, (state) => {
            state.useProxy = useProxy;
            localStorage.setItem("settings", JSON.stringify(state));
        });
    }
);

export const showDevPanelAtom = atomWithImmer({
    jotai: true,
    tanStack: true,
});
