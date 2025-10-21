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

export const setThemeAtom = atom(null, (_get, set, theme: Theme) => {
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

export const setThemeWithAnimateAtom = atom(null, async (get, set, theme: Theme, duration: number = 300) => {
    const oldTheme = get(themeAtom);

    if (oldTheme === theme) return;

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? Theme.DARK : Theme.LIGHT;

    set(themeAtom, theme);
    localStorage.setItem("theme", theme);

    const oldDocTheme = oldTheme === Theme.AUTO ? systemTheme : oldTheme;
    const newDocTheme = theme === Theme.AUTO ? systemTheme : theme;

    if (oldDocTheme === newDocTheme) return;

    await document.startViewTransition(() => {
        const root = window.document.documentElement;
        root.classList.remove(Theme.DARK, Theme.LIGHT, Theme.AUTO);
        root.classList.add(newDocTheme);
    }).ready;

    const startPoint = { x: 0, y: 0 };
    const endRadius = Math.hypot(Math.max(startPoint.x, innerWidth - startPoint.x), Math.max(startPoint.y, innerHeight - startPoint.y));

    document.documentElement.animate(
        {
            clipPath: [
                `circle(0px at ${startPoint.x}px ${startPoint.y}px)`,
                `circle(${endRadius}px at ${startPoint.x}px ${startPoint.y}px)`,
            ],
        },
        {
            duration,
            easing: "ease-in",
            pseudoElement: "::view-transition-new(root)",
        },
    );
});
