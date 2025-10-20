import logging from "@lavascope/log";
import { useLingui } from "@lingui/react/macro";
import {
    mdiWindowClose,
    mdiWindowMaximize,
    mdiWindowMinimize,
    mdiWindowRestore,
} from "@mdi/js";
import Icon from "@mdi/react";
import { getCurrentWindow, Window } from "@tauri-apps/api/window";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";

import appIcon from "@/assets/img/app-icon.png";
import tauriNotify from "@/hooks/notification";
import { Platform, platformAtom } from "@/store/environment";

const mainWindowLabel = "main";

export default function TauriTitleBar() {
    const platform = useAtomValue(platformAtom);

    const mainWindowRef = useRef<Window | null>(null);
    const unlistenCloseRef = useRef(() => {});
    const unlistenResizeRef = useRef<Partial<Record<string, () => void>>>({});
    const isFirstClosed = useRef<boolean>(true);

    const [isMaximized, setIsMaximized] = useState(false);

    const { t } = useLingui();

    const onWindowDrag = useCallback(
        async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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
    const onWindowMinimize = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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
    const onWindowMaximize = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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
    const onWindowClose = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                const window = getCurrentWindow();
                if (window.label !== mainWindowLabel) {
                    await window.close();
                    return;
                }
                await window.hide();
                if (!isFirstClosed.current) return;
                await tauriNotify(
                    t`The application is still running in the background.`
                );
                isFirstClosed.current = false;
            } catch (err) {
                logging.error(`Error while closing window: ${err}`);
            }
        },
        []
    );

    useEffect(() => {
        const currentMode = import.meta.env.MODE;
        const isModeDev = currentMode === "development";

        logging.info(`Current Platform: ${platform}`);
        logging.info(`User Agent: ${navigator.userAgent}`);
        logging.info(`Current Mode: ${currentMode}`);

        if ([Platform.IOS, Platform.ANDROID, Platform.WEB].includes(platform))
            return;

        const setInitialMaximizeState = async () => {
            const currentWindow = getCurrentWindow();
            const isMaximized = await currentWindow.isMaximized();
            setIsMaximized(isMaximized);
        };
        const addMainWindowOnCloseListener = async () => {
            const window = await Window.getByLabel(mainWindowLabel);
            mainWindowRef.current = window;
            if (window) {
                unlistenCloseRef.current = await window.onCloseRequested(
                    async (event) => {
                        event.preventDefault();
                        await window.hide();
                        if (isFirstClosed.current) {
                            await tauriNotify(
                                t`The application is still running in the background.`
                            );
                            isFirstClosed.current = false;
                        }
                    }
                );
            }
        };
        const addWindowResizeListener = async () => {
            const currentWindow = getCurrentWindow();
            unlistenResizeRef.current[currentWindow.label] =
                await currentWindow.onResized(async () =>
                    setIsMaximized(await currentWindow.isMaximized())
                );
        };

        const preventContextMenu = isModeDev ?
            () => {} :
            (e: MouseEvent) => e.preventDefault();

        const preventRefreshKey = isModeDev ?
            () => {} :
            (e: KeyboardEvent) => {
                if (e.key === "F5" || (e.key === "r" && e.ctrlKey))
                    e.preventDefault();
            };

        const initialTasks = async () => {
            document.addEventListener("contextmenu", preventContextMenu);
            document.addEventListener("keydown", preventRefreshKey);
            try {
                await addMainWindowOnCloseListener();
            } catch (err) {
                logging.error(
                    `Error while adding main window close listener: ${err}`
                );
            }
            try {
                await setInitialMaximizeState();
            } catch (err) {
                logging.error(
                    `Error while setting initial maximize state: ${err}`
                );
            }
            try {
                await addWindowResizeListener();
            } catch (err) {
                logging.error(
                    `Error while adding window resize listener: ${err}`
                );
            }
        };

        const currentWindow = getCurrentWindow();
        initialTasks();

        return () => {
            unlistenCloseRef.current();
            const unlistenResize =
                unlistenResizeRef.current[currentWindow.label];
            if (unlistenResize) {
                unlistenResize();
                delete unlistenResizeRef.current[currentWindow.label];
            }

            document.removeEventListener("contextmenu", preventContextMenu);
            document.removeEventListener("keydown", preventRefreshKey);
        };
    }, []);

    if (platform !== Platform.WINDOWS) {
        return <></>;
    }

    return (
        <div
            className="sticky flex w-full h-8 select-none z-50"
            onMouseDown={onWindowDrag}
        >
            <div className="absolute flex items-center justify-center right-0 h-full">
                <button
                    className="text-default-400 h-full px-2 hover:bg-default-400 hover:text-default-foreground cursor-default transition-colors-opacity duration-75"
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={onWindowMinimize}
                >
                    <Icon path={mdiWindowMinimize} size={1} />
                </button>
                <button
                    className="text-default-400 h-full px-2 hover:bg-default-400 hover:text-default-foreground cursor-default transition-colors-opacity duration-75"
                    onMouseUp={onWindowMaximize}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <Icon
                        path={
                            isMaximized ? mdiWindowRestore : mdiWindowMaximize
                        }
                        size={1}
                    />
                </button>
                <button
                    className="text-default-400 h-full px-2 hover:bg-danger hover:text-default-foreground cursor-default transition-colors-opacity duration-75"
                    onMouseUp={onWindowClose}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <Icon path={mdiWindowClose} size={1} />
                </button>
            </div>
            <div className="mx-0 flex items-center justify-center gap-1 sm:mx-auto">
                <img
                    alt="LavaScope Logo"
                    src={appIcon}
                    className="px-1 w-10"
                />
                <h1 className="hidden text-default-400 font-bold text-medium sm:block">
                    LavaScope
                </h1>
            </div>
        </div>
    );
}
