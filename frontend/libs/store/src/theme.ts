import { atom } from "jotai";

export enum Theme {
    Caffeine = "caffeine",
    Neutral = "neutral",
    Orange = "orange",
    StarryNight = "starry-night",
    Stone = "stone",
    Zinc = "zinc",
}

const STORAGE_KEY = "theme";

export function initTheme(): Theme {
    let cachedTheme: string | null = localStorage.getItem(STORAGE_KEY);
    console.log(cachedTheme);
    if (
        !cachedTheme ||
        !(Object.values(Theme) as string[]).includes(cachedTheme)
    ) {
        localStorage.setItem(STORAGE_KEY, Theme.StarryNight);
        cachedTheme = Theme.StarryNight;
    }

    const root = window.document.documentElement;
    root.dataset.theme = cachedTheme;

    return cachedTheme as Theme;
}

export const themeAtom = atom(initTheme());

export const setThemeAtom = atom(null, (_get, set, theme: Theme) => {
    set(themeAtom, theme);
    localStorage.setItem(STORAGE_KEY, theme);

    const root = window.document.documentElement;
    root.dataset.theme = theme;
});

export const setThemeWithAnimationAtom = atom(null, async (get, set, theme: Theme, duration: number = 300) => {
    const oldTheme = get(themeAtom);

    if (oldTheme === theme) return;

    set(themeAtom, theme);
    localStorage.setItem(STORAGE_KEY, theme);

    await document.startViewTransition(() => {
        const root = window.document.documentElement;
        root.dataset.theme = theme;
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
