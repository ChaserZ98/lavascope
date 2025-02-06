import { useCallback, useEffect, useRef, useState } from "react";

import {
    mdiWindowClose,
    mdiWindowMaximize,
    mdiWindowMinimize,
    mdiWindowRestore,
} from "@mdi/js";
import Icon from "@mdi/react";
import { Image } from "@heroui/react";
import { Window, getCurrentWindow } from "@tauri-apps/api/window";

import tauriNotify from "@/hooks/notification";
import logging from "@/utils/log";
import { Environment, useEnvironmentStore } from "@/zustand/environment";

import appIcon from "@img/app-icon.png";

const mainWindowLabel = "main";

export default function TauriTitleBar() {
    const environment = useEnvironmentStore((state) => state.environment);

    const mainWindowRef = useRef<Window | null>(null);
    const unlistenCloseRef = useRef(() => {});
    const unlistenResizeRef = useRef<Partial<Record<string, () => void>>>({});
    const isFirstClosed = useRef(true);

    const [isMaximized, setIsMaximized] = useState(false);

    const onWindowDrag = useCallback(
        (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (e.buttons !== 1) return;

            e.preventDefault();
            const currentWindow = getCurrentWindow();
            if (e.detail === 2) {
                currentWindow
                    .toggleMaximize()
                    .then(() => getCurrentWindow().isMaximized())
                    .then((maximize) => setIsMaximized(maximize))
                    .catch((err) => logging.error(`${err}`));
            } else {
                currentWindow
                    .startDragging()
                    .catch((err) => logging.error(`${err}$`));
            }
        },
        []
    );
    const onWindowMinimize = useCallback(
        (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.preventDefault();
            e.stopPropagation();
            getCurrentWindow()
                .minimize()
                .catch((err) => logging.error(`${err}`));
        },
        []
    );
    const onWindowMaximize = useCallback(
        (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.preventDefault();
            e.stopPropagation();

            const currentWindow = getCurrentWindow();
            currentWindow
                .toggleMaximize()
                .then(() => currentWindow.isMaximized())
                .then((maximize) => setIsMaximized(maximize))
                .catch((err) => logging.error(`${err}`));
        },
        []
    );
    const onWindowClose = useCallback(
        (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.preventDefault();
            e.stopPropagation();

            const window = getCurrentWindow();
            if (window.label === mainWindowLabel) {
                window
                    .hide()
                    .then(() => {
                        if (!isFirstClosed.current) return null;
                        return tauriNotify(
                            "The application is still running in the background."
                        );
                    })
                    .then((task) => {
                        if (!task) return;
                        isFirstClosed.current = false;
                    });
            } else {
                window.close().catch((err) => logging.error(`${err}`));
            }
        },
        []
    );

    useEffect(() => {
        const currentMode = import.meta.env.MODE;
        const isModeDev = currentMode === "development";

        logging.info(`Current Platform: ${environment}`);
        logging.info(`User Agent: ${navigator.userAgent}`);
        logging.info(`Current Mode: ${currentMode}`);

        if (
            [Environment.IOS, Environment.ANDROID, Environment.WEB].includes(
                environment
            )
        )
            return;

        Window.getByLabel(mainWindowLabel).then((window) => {
            mainWindowRef.current = window;
            window
                ?.onCloseRequested(async (event) => {
                    event.preventDefault();
                    await window.hide();
                    if (isFirstClosed.current) {
                        await tauriNotify(
                            "The application is still running in the background."
                        );
                        isFirstClosed.current = false;
                    }
                })
                .then((unlisten) => {
                    unlistenCloseRef.current = unlisten;
                });
        });

        const currentWindow = getCurrentWindow();

        currentWindow
            .isMaximized()
            .then((isMaximized) => setIsMaximized(isMaximized));
        currentWindow
            .onResized(async () => {
                setIsMaximized(await currentWindow.isMaximized());
            })
            .then((unlisten) => {
                unlistenResizeRef.current[currentWindow.label] = unlisten;
            });

        const preventContextMenu = isModeDev
            ? () => {}
            : (e: MouseEvent) => e.preventDefault();

        const preventRefreshKey = isModeDev
            ? () => {}
            : (e: KeyboardEvent) => {
                  if (e.key === "F5" || (e.key === "r" && e.ctrlKey))
                      e.preventDefault();
              };

        document.addEventListener("contextmenu", preventContextMenu);
        document.addEventListener("keydown", preventRefreshKey);

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

    if (environment !== Environment.WINDOWS) {
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
                <Image
                    alt="Vultr Firewall Watcher Logo"
                    src={appIcon}
                    className="px-1 w-10"
                />
                <h1 className="hidden text-default-400 font-bold text-medium sm:block">
                    Vultr Firewall Watcher
                </h1>
            </div>
        </div>
    );
}
