import { atom } from "jotai";

export enum Theme {
    LIGHT = "light",
    DARK = "dark",
    AUTO = "auto",
}

export function initTheme(): Theme {
    let cachedTheme: string | null = localStorage.getItem("theme");
    if (
        !cachedTheme ||
        !(Object.values(Theme) as string[]).includes(cachedTheme)
    ) {
        localStorage.setItem("theme", Theme.AUTO);
        cachedTheme = Theme.AUTO;
    }

    const root = window.document.documentElement;
    root.classList.remove(Theme.DARK, Theme.LIGHT, Theme.AUTO);

    if (cachedTheme === Theme.AUTO) {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? Theme.DARK : Theme.LIGHT;
        root.classList.add(systemTheme);
    } else {
        root.classList.add(cachedTheme);
    }

    return cachedTheme as Theme;
}

export const themeAtom = atom(Theme.AUTO);

export const setThemeAtom = atom(null, (get, set, theme: Theme) => {
    set(themeAtom, theme);
    localStorage.setItem("theme", theme);

    const root = window.document.documentElement;
    root.classList.remove(Theme.DARK, Theme.LIGHT, Theme.AUTO);
    if (theme === Theme.AUTO) {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? Theme.DARK : Theme.LIGHT;
        root.classList.add(systemTheme);
        return;
    }
    root.classList.add(theme);
});
