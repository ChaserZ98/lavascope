import { atom } from "jotai";

import logging from "@/utils/log";

export type Settings = {
    proxyAddress: string;
    useProxy: boolean;
    apiToken: string;
};

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

export const settingsAtom = atom(createInitialSettings());
export const setSettingsAtom = atom(null, (_get, set, settings: Settings) => {
    localStorage.setItem("settings", JSON.stringify(settings));
    set(settingsAtom, settings);
});
