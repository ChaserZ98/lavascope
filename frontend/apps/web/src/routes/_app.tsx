import { dynamicActivate } from "@lavascope/i18n";
import logging from "@lavascope/log";
import { AppSidebar } from "@lavascope/ui/components/lavascope/app-sidebar";
import { SiteHeader } from "@lavascope/ui/components/lavascope/site-header";
import { SidebarInset, SidebarProvider } from "@lavascope/ui/components/ui/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import {
    IncompatiblePlatformError,
    useFocusWindow,
    WindowNotFoundError,
} from "@/hooks/window";
import { platformAtom } from "@/store/environment";
import { languageAtom } from "@/store/language";
import { addScreenSizeListener, screenSizeAtom } from "@/store/screen";
import checkCompatibility from "@/utils/compatibility";

export const Route = createFileRoute("/_app")({
    component: RouteComponent,
});

function RouteComponent() {
    const platform = useAtomValue(platformAtom);

    const setScreenSize = useSetAtom(screenSizeAtom);

    const language = useAtomValue(languageAtom);

    const focusWindow = useFocusWindow("main");

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
        checkCompatibility(platform);
        const removeScreenSizeListener = addScreenSizeListener(setScreenSize);
        return () => removeScreenSizeListener();
    }, []);

    return (
        <div className="flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] w-full h-screen md:pb-0">
            <SidebarProvider
                defaultOpen
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)"
                    } as React.CSSProperties
                }
            >
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col">
                        <Outlet />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
