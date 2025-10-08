import { isTauri } from "@tauri-apps/api/core";
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

export const platformAtom = atom(
    isTauri() ? (type() as Platform) : Platform.WEB
);
