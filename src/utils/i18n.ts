import { i18n } from "@lingui/core";
import { invoke } from "@tauri-apps/api/core";

import { Platform } from "@/store/environment";

import logging from "./log";

export enum Locale {
    en = "en",
    zh = "zh",
    zh_hant = "zh-Hant",
}

export function toLocalString(locale: Locale): string {
    switch (locale) {
        case Locale.en:
            return "English";
        case Locale.zh:
            return "简体中文";
        case Locale.zh_hant:
            return "繁體中文";
        default:
            throw new Error(`Unknown locale: ${locale}`);
    }
}

export async function initializeI18n(
    locale: Locale = Locale.en,
    platform: Platform = Platform.WEB
) {
    await dynamicActivate(locale, platform);
}

export async function dynamicActivate(locale: string, platform: Platform) {
    await setReactLocale(locale);
    if (platform !== Platform.WEB) await setTauriTrayLocale(locale);
}

export async function setReactLocale(locale: string) {
    try {
        const { messages } = await import(`../locales/${locale}.po`);
        i18n.load(locale, messages);
        i18n.activate(locale);
        logging.info(`Activated locale: ${locale}`);
    } catch (error) {
        logging.error(`Failed to activate locale ${locale} on React: ${error}`);
    }
}

export async function setTauriTrayLocale(locale: string) {
    try {
        await invoke("toggle_locale", {
            localeString: locale,
        });
    } catch (e) {
        logging.error(`Failed to toggle locale ${locale} on Tauri: ${e}`);
    }
}
