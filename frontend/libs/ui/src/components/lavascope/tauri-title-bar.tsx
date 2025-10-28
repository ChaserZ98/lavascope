import { useAllPlatformEffect, useDesktopEffect } from "@lavascope/hook";
import logging from "@lavascope/log";
import { Platform, platformAtom } from "@lavascope/store";
import { Button } from "@lavascope/ui/components/ui";
import {
    mdiWindowClose,
    mdiWindowMaximize,
    mdiWindowMinimize,
    mdiWindowRestore,
} from "@mdi/js";
import Icon from "@mdi/react";
import type { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWindow, Window } from "@tauri-apps/api/window";
import { useAtomValue } from "jotai";
import { type MouseEventHandler, useCallback, useEffect, useRef, useState } from "react";

const mainWindowLabel = "main";
const tauriTitleBarHeight = "2rem";

function TauriTitleBar({ style }: React.ComponentProps<"div">) {
    const platform = useAtomValue(platformAtom);

    // const { t } = useLingui();

    const unlistenResizeRef = useRef<UnlistenFn>(() => {});
    // const isFirstClosed = useRef<boolean>(true);

    const [isMaximized, setIsMaximized] = useState(false);

    const appMode = import.meta.env.MODE;

    const onWindowDrag = useCallback<MouseEventHandler<HTMLDivElement>>(
        async (e) => {
            if (e.buttons !== 1) return;

            e.preventDefault();
            try {
                const currentWindow = getCurrentWindow();
                if (e.detail === 1) {
                    // Single click -> start dragging
                    await currentWindow.startDragging();
                    return;
                }
                // Double click or click more than twice -> toggle window maximize
                await currentWindow.toggleMaximize();
                const isMaximize = await getCurrentWindow().isMaximized();
                setIsMaximized(isMaximize);
            } catch (err) {
                if (e.detail === 1)
                    logging.error(`Error while dragging window: ${err}`);
                else
                    logging.error(
                        `Error while toggling window maximize: ${err}`
                    );
            }
        },
        []
    );
    const onWindowMinimize = useCallback<MouseEventHandler<HTMLButtonElement>>(
        async (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                await getCurrentWindow().minimize();
            } catch (err) {
                logging.error(`Error while minimizing window: ${err}`);
            }
        },
        []
    );
    const onWindowMaximize = useCallback<MouseEventHandler<HTMLButtonElement>>(
        async (e) => {
            e.preventDefault();
            e.stopPropagation();

            try {
                const currentWindow = getCurrentWindow();
                await currentWindow.toggleMaximize();
                const isMaximize = await currentWindow.isMaximized();
                setIsMaximized(isMaximize);
            } catch (err) {
                logging.error(`Error while maximizing window: ${err}`);
            }
        },
        []
    );
    const onWindowClose = useCallback<MouseEventHandler<HTMLButtonElement>>(
        async (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                const window = getCurrentWindow();
                // if (window.label !== mainWindowLabel) {
                //     await window.close();
                //     return;
                // }
                // await window.hide();
                // if (!isFirstClosed.current) return;
                // await tauriNotify(
                //     t`The application is still running in the background.`
                // );
                // isFirstClosed.current = false;
                await window.close();
            } catch (err) {
                logging.error(`Error while closing window: ${err}`);
            }
        },
        []
    );

    useAllPlatformEffect({ appMode, platform });

    useEffect(() => {
        if (platform !== Platform.WINDOWS) return;

        const currentWindow = getCurrentWindow();
        currentWindow.isMaximized()
            .then((res) => setIsMaximized(res))
            .catch((e) => logging.error(`Error while checking window maximize state: ${e}`));
    }, []);

    useDesktopEffect({ appMode, platform });

    useEffect(() => {
        if (platform !== Platform.WINDOWS) return;

        Window.getByLabel(mainWindowLabel)
            .then((window) => {
                if (!window) throw new Error("No window with label 'main' found.");
                return window.onResized(async () => setIsMaximized(await window.isMaximized()));
            })
            .then((fn) => {
                unlistenResizeRef.current = fn;
            })
            .catch((e) => logging.error(`Error while adding window resize listener: ${e}`));

        return () => {
            unlistenResizeRef.current();
            unlistenResizeRef.current = () => {};
        };
    }, []);

    if (platform !== Platform.WINDOWS) {
        return null;
    }

    return (
        <div
            className="sticky flex w-full h-(--tauri-title-bar-height) select-none z-50 bg-sidebar"
            style={
                {
                    "--tauri-title-bar-height": tauriTitleBarHeight,
                    ...style
                } as React.CSSProperties
            }
            onMouseDown={onWindowDrag}
        >
            <div className="absolute flex items-center justify-center right-0 h-full">
                <Button
                    className="h-full px-2 cursor-default bg-sidebar text-sidebar-foreground"
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={onWindowMinimize}
                >
                    <Icon path={mdiWindowMinimize} size={1} />
                </Button>
                <Button
                    className="h-full px-2 cursor-default bg-sidebar text-sidebar-foreground"
                    onMouseUp={onWindowMaximize}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <Icon
                        path={
                            isMaximized ? mdiWindowRestore : mdiWindowMaximize
                        }
                        size={1}
                    />
                </Button>
                <Button
                    className="h-full px-2 cursor-default bg-sidebar text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground"
                    onMouseUp={onWindowClose}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <Icon path={mdiWindowClose} size={1} />
                </Button>
            </div>
            <div className="mx-0 flex items-center justify-center gap-1 sm:mx-auto">
                <img
                    alt="LavaScope Logo"
                    src="/favicon.ico"
                    className="px-1 w-10"
                />
                <h1 className="hidden text-sidebar-foreground font-bold text-medium sm:block">
                    LavaScope
                </h1>
            </div>
        </div>
    );
}

export { TauriTitleBar };
