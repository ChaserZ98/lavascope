import { type } from "@tauri-apps/plugin-os";
import { atom } from "jotai";

export enum Environment {
    LINUX = "linux",
    MACOS = "macos",
    WINDOWS = "windows",
    IOS = "ios",
    ANDROID = "android",
    WEB = "web",
}

export const environmentAtom = atom(
    !("__TAURI_INTERNALS__" in window)
        ? Environment.WEB
        : (type() as Environment)
);
