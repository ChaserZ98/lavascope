import { atom } from "jotai";

export enum Locale {
    en = "en",
    zh = "zh",
    zh_hant = "zh-Hant",
}

function createInitialLanguage(): Locale {
    let cachedLanguage: string | null = localStorage.getItem("language");
    if (
        !cachedLanguage ||
        !(Object.values(Locale) as string[]).includes(cachedLanguage)
    ) {
        cachedLanguage = window.navigator.language.split("-")[0] as Locale;
        localStorage.setItem("language", cachedLanguage);
    }
    return cachedLanguage as Locale;
}

export const languageAtom = atom(createInitialLanguage());
