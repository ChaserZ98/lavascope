import { i18n } from "@lingui/core";

import logging from "./log";

export enum Locales {
    en = "en",
    zh = "zh",
    zh_hant = "zh-Hant",
}

export function toLocalString(locale: Locales): string {
    switch (locale) {
        case Locales.en:
            return "English";
        case Locales.zh:
            return "简体中文";
        case Locales.zh_hant:
            return "繁體中文";
        default:
            throw new Error(`Unknown locale: ${locale}`);
    }
}

export async function dynamicActivate(locale: string) {
    try {
        const { messages } = await import(`../locales/${locale}.po`);
        i18n.load(locale, messages);
        i18n.activate(locale);
        logging.info(`Activated locale ${locale}`);
    } catch (error) {
        logging.error(`Failed to activate locale ${locale}: ${error}`);
    }
}
