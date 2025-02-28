import { atom } from "jotai";

import { Locale } from "@/utils/i18n";

function createInitialLanguage(): Locale {
    let cachedLanguage: string | null = localStorage.getItem("language");
    if (
        !cachedLanguage ||
        !(Object.values(Locale) as string[]).includes(cachedLanguage)
    ) {
        cachedLanguage = window.navigator.language.split("-")[0];
        localStorage.setItem("language", cachedLanguage);
    }
    return cachedLanguage as Locale;
}

export const languageAtom = atom(createInitialLanguage());
