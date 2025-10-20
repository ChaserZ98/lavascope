import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { atom } from "jotai";

export const autoStartAtom = atom(false);

export const setAutoStartAtom = atom(null, async (get, set, value: boolean) => {
    if (value) await enable();
    else await disable();
    set(autoStartAtom, value);
});

export const setInitialAutoStartAtom = atom(null, async (get, set) => {
    const enabled = await isEnabled();
    set(autoStartAtom, enabled);
});
