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

export function dynamicActivate(locale: string) {
    import(`../locales/${locale}.po`)
        .then(({ messages }) => {
            i18n.load(locale, messages);
            i18n.activate(locale);
        })
        .catch((error) => {
            logging.error(`Failed to activate locale ${locale}: ${error}`);
        });
}
