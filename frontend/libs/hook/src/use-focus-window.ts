import { Platform, platformAtom } from "@lavascope/store";
import { Window } from "@tauri-apps/api/window";
import { useAtomValue } from "jotai";
import { useCallback } from "react";

export class IncompatiblePlatformError extends Error {
    constructor() {
        super("This hook is only compatible with MacOS, Windows, and Linux");
    }
}

export class WindowNotFoundError extends Error {
    constructor(label: string) {
        super(`Window with label "${label}" not found`);
    }
}

/**
 * `async function` to focus the specified Tauri window
 *
 * @throws {IncompatiblePlatformError} if the platform is not MacOS, Windows, or Linux
 *
 * @throws {WindowNotFoundError} if the specified `label` passed to the hook does not match any window
 */
type FocusWindowFn = () => Promise<void>;

/**
 * Hook that returns an `async function` to focus a Tauri window by label
 *
 * (only works in `MacOS`, `Windows`, and `Linux`)
 *
 * @param label - the label of the window to focus
 * @returns the `async function` to focus the window
 */
export function useFocusWindow(label: string): FocusWindowFn {
    const platform = useAtomValue(platformAtom);

    const focusWindow = useCallback(async () => {
        if ([Platform.WEB, Platform.ANDROID, Platform.IOS].includes(platform))
            throw new IncompatiblePlatformError();

        const window = await Window.getByLabel(label);
        if (!window) throw new WindowNotFoundError(label);

        await window.setFocus();
    }, [platform, label]);

    return focusWindow;
}
