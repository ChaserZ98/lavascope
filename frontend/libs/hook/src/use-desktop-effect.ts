import logging from "@lavascope/log";
import { tauriNotify } from "@lavascope/notification";
import { Platform } from "@lavascope/store";
import { useLingui } from "@lingui/react/macro";
import type { UnlistenFn } from "@tauri-apps/api/event";
import { Window } from "@tauri-apps/api/window";
import { useEffect, useRef } from "react";

function usePreventContextMenu({ isDevMode, isDesktop }: { isDevMode: boolean; isDesktop: boolean }) {
    useEffect(() => {
        if (!isDesktop) return;

        const preventContextMenu = isDevMode ? () => {} : (e: MouseEvent) => e.preventDefault();
        document.addEventListener("contextmenu", preventContextMenu);

        return () => {
            document.removeEventListener("contextmenu", preventContextMenu);
        };
    }, [isDevMode, isDesktop]);
}

function usePreventRefreshKey({ isDevMode, isDesktop }: { isDevMode: boolean; isDesktop: boolean }) {
    useEffect(() => {
        if (!isDesktop) return;

        const preventRefreshKey = isDevMode ?
            () => {} :
            (e: KeyboardEvent) => {
                if (e.key === "F5" || (e.key === "r" && e.ctrlKey)) e.preventDefault();
            };
        document.addEventListener("keydown", preventRefreshKey);

        return () => {
            document.removeEventListener("keydown", preventRefreshKey);
        };
    }, [isDevMode, isDesktop]);
}

function useWindowOnCloseEffect({ isDesktop }: { isDesktop: boolean }) {
    const { t } = useLingui();

    const unlistenCloseRef = useRef<UnlistenFn>(() => {});
    const isFirstCloseEvent = useRef<boolean>(true);

    useEffect(() => {
        if (!isDesktop) return;

        Window.getByLabel("main")
            .then((window) => {
                if (!window) throw new Error("Window not found");
                return window.onCloseRequested(async (e) => {
                    e.preventDefault();
                    await window.hide();
                    if (isFirstCloseEvent.current) {
                        await tauriNotify(
                            t`The application is still running in the background.`
                        );
                        isFirstCloseEvent.current = false;
                    }
                });
            })
            .then((fn) => {
                unlistenCloseRef.current = fn;
            })
            .catch((e) => {
                logging.error(`Error while setting up window close event listener: ${e}`);
            });

        return () => {
            unlistenCloseRef.current();
            unlistenCloseRef.current = () => {};
        };
    }, [t, isDesktop]);
}

function useDesktopEffect({ appMode, platform }: { appMode: string; platform: Platform }) {
    const isDevMode = appMode === "development";
    const isDesktop = [Platform.WINDOWS, Platform.LINUX, Platform.MACOS].includes(platform);

    usePreventContextMenu({ isDevMode, isDesktop });
    usePreventRefreshKey({ isDevMode, isDesktop });
    useWindowOnCloseEffect({ isDesktop });
}

export { useDesktopEffect };
