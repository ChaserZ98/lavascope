import { type } from "@tauri-apps/plugin-os";
import { atom } from "jotai";

export enum Platform {
    LINUX = "linux",
    MACOS = "macos",
    WINDOWS = "windows",
    IOS = "ios",
    ANDROID = "android",
    WEB = "web",
}

export const isTauriAtom = atom("__TAURI_INTERNALS__" in window);

export const platformAtom = atom((get) =>
    get(isTauriAtom) ? (type() as Platform) : Platform.WEB
);
