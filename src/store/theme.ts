import { atom } from "jotai";

export enum Theme {
    LIGHT = "light",
    DARK = "dark",
}

function createInitialTheme(): Theme {
    let cachedTheme: string | null = localStorage.getItem("theme");
    if (
        !cachedTheme ||
        !(Object.values(Theme) as string[]).includes(cachedTheme)
    ) {
        cachedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ?
            Theme.DARK :
            Theme.LIGHT;
        localStorage.setItem("theme", cachedTheme);
    }
    if (cachedTheme === Theme.LIGHT) {
        document.documentElement.classList.remove("dark");
    } else if (cachedTheme === Theme.DARK && !document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.add("dark");
    }
    return cachedTheme as Theme;
}

export const themeAtom = atom(createInitialTheme());

export const toggleThemeAtom = atom(null, (get, set) => {
    const currentTheme = get(themeAtom);
    const newTheme = currentTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
    set(themeAtom, newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === Theme.LIGHT) {
        document.documentElement.classList.remove("dark");
    } else if (newTheme === Theme.DARK && !document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.add("dark");
    }
});
