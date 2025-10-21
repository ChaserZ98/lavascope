import { atom } from "jotai";

export enum ColorScheme {
    LIGHT = "light",
    DARK = "dark",
    AUTO = "auto",
}

const STORAGE_KEY = "color-scheme";

export function initColorScheme(): ColorScheme {
    let cachedColorScheme: string | null = localStorage.getItem(STORAGE_KEY);
    if (
        !cachedColorScheme ||
        !(Object.values(ColorScheme) as string[]).includes(cachedColorScheme)
    ) {
        localStorage.setItem(STORAGE_KEY, ColorScheme.AUTO);
        cachedColorScheme = ColorScheme.AUTO;
    }

    const root = window.document.documentElement;
    root.classList.remove(ColorScheme.DARK, ColorScheme.LIGHT, ColorScheme.AUTO);

    if (cachedColorScheme === ColorScheme.AUTO) {
        const systemColorScheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? ColorScheme.DARK : ColorScheme.LIGHT;
        root.classList.add(systemColorScheme);
    } else {
        root.classList.add(cachedColorScheme);
    }

    return cachedColorScheme as ColorScheme;
}

export const colorSchemeAtom = atom(initColorScheme());

export const setColorSchemeAtom = atom(null, (_get, set, colorScheme: ColorScheme) => {
    set(colorSchemeAtom, colorScheme);
    localStorage.setItem(STORAGE_KEY, colorScheme);

    const root = window.document.documentElement;
    root.classList.remove(ColorScheme.DARK, ColorScheme.LIGHT, ColorScheme.AUTO);
    if (colorScheme === ColorScheme.AUTO) {
        const systemColorScheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? ColorScheme.DARK : ColorScheme.LIGHT;
        root.classList.add(systemColorScheme);
        return;
    }
    root.classList.add(colorScheme);
});

export const setColorSchemeWithAnimationAtom = atom(null, async (get, set, colorScheme: ColorScheme, duration: number = 300) => {
    const oldColorScheme = get(colorSchemeAtom);

    if (oldColorScheme === colorScheme) return;

    const systemColorScheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? ColorScheme.DARK : ColorScheme.LIGHT;

    set(colorSchemeAtom, colorScheme);
    localStorage.setItem(STORAGE_KEY, colorScheme);

    const oldDocColorScheme = oldColorScheme === ColorScheme.AUTO ? systemColorScheme : oldColorScheme;
    const newDocColorScheme = colorScheme === ColorScheme.AUTO ? systemColorScheme : colorScheme;

    if (oldDocColorScheme === newDocColorScheme) return;

    await document.startViewTransition(() => {
        const root = window.document.documentElement;
        root.classList.remove(ColorScheme.DARK, ColorScheme.LIGHT, ColorScheme.AUTO);
        root.classList.add(newDocColorScheme);
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
