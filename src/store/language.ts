import { atom } from "jotai";

import { dynamicActivate, Locales } from "@/utils/i18n";

function createInitialLanguage(): Locales {
    let cachedLanguage: string | null = localStorage.getItem("language");
    if (
        !cachedLanguage ||
        !(Object.values(Locales) as string[]).includes(cachedLanguage)
    ) {
        cachedLanguage = window.navigator.language.split("-")[0];
        localStorage.setItem("language", cachedLanguage);
    }
    return cachedLanguage as Locales;
}

export const languageAtom = atom(createInitialLanguage());

export const changeLanguageAtom = atom(
    null,
    async (_get, set, newLanguage: Locales) => {
        await dynamicActivate(newLanguage);
        localStorage.setItem("language", newLanguage);
        set(languageAtom, newLanguage);
    }
);
