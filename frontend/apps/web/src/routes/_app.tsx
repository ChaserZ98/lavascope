import {
    IncompatiblePlatformError,
    useFocusWindow,
    WindowNotFoundError,
} from "@lavascope/hook";
import { dynamicActivate } from "@lavascope/i18n";
import logging from "@lavascope/log";
import { addScreenSizeListener, languageAtom, Platform, platformAtom, screenSizeAtom } from "@lavascope/store";
import { AppSidebar } from "@lavascope/ui/components/lavascope/app-sidebar";
import { SiteHeader } from "@lavascope/ui/components/lavascope/site-header";
import { TauriTitleBar } from "@lavascope/ui/components/lavascope/tauri-title-bar";
import { SidebarInset, SidebarProvider } from "@lavascope/ui/components/ui/sidebar";
import { Trans } from "@lingui/react/macro";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { toast } from "sonner";

import { checkCompatibility, CompatibilityError } from "@/utils/compatibility";

export const Route = createFileRoute("/_app")({
    component: RouteComponent,
});

function RouteComponent() {
    const platform = useAtomValue(platformAtom);

    const setScreenSize = useSetAtom(screenSizeAtom);

    const language = useAtomValue(languageAtom);

    const focusWindow = useFocusWindow("main");

    const tauriTitleBarHeight = platform === Platform.WINDOWS ? "calc(var(--spacing) * 8)" : "0rem";

    useEffect(() => {
        focusWindow()
            .then(() => {
                logging.info("Successfully focused main window");
            })
            .catch((e) => {
                if (e instanceof WindowNotFoundError) {
                    logging.warn(`Skipping focus main window: ${e.message}`);
                    return;
                }
                if (e instanceof IncompatiblePlatformError) {
                    logging.info(`Skipping focus main window: ${e.message}`);
                    return;
                }
                logging.error(`Failed to focus main window: ${e}`);
            });
        dynamicActivate(language, platform);
        try {
            checkCompatibility(platform);
        } catch (e) {
            const message = e instanceof CompatibilityError ? e.message : "Unknown Error";
            toast.warning(
                () => <Trans>Compatibility Warning</Trans>,
                { description: message, duration: Infinity }
            );
        }

        const removeScreenSizeListener = addScreenSizeListener(setScreenSize);
        return () => removeScreenSizeListener();
    }, []);

    return (
        <div
            className="flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] w-full h-screen select-none md:pb-0"
        >
            <TauriTitleBar style={
                {
                    "--tauri-title-bar-height": tauriTitleBarHeight
                } as React.CSSProperties
            }
            />
            <SidebarProvider
                defaultOpen
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 60)",
                        "--header-height": "calc(var(--spacing) * 16)",
                        "--tauri-title-bar-height": tauriTitleBarHeight
                    } as React.CSSProperties
                }
            >
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        <Outlet />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
