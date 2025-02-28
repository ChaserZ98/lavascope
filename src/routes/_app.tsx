import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";

import { BottomNavigation, Navigation } from "@/components/Navbar";
import TauriTitleBar from "@/components/TauriTitleBar";
import { platformAtom } from "@/store/environment";
import { languageAtom } from "@/store/language";
import { addScreenSizeListener, screenSizeAtom } from "@/store/screen";
import checkCompatibility from "@/utils/compatibility";
import { dynamicActivate } from "@/utils/i18n";

export const Route = createFileRoute("/_app")({
    component: RouteComponent,
});

function RouteComponent() {
    const platform = useAtomValue(platformAtom);

    const setScreenSize = useSetAtom(screenSizeAtom);

    const language = useAtomValue(languageAtom);

    useEffect(() => {
        dynamicActivate(language, platform);
        checkCompatibility(platform);
        const removeScreenSizeListener = addScreenSizeListener(setScreenSize);
        return () => removeScreenSizeListener();
    }, []);

    return (
        <div className="flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] w-full h-screen md:pb-0">
            <div className="w-full sticky top-0">
                <TauriTitleBar />
                <Navigation />
            </div>
            <div className="flex-1 pt-4 overflow-auto ">
                <Outlet />
            </div>
            <BottomNavigation />
            <ToastContainer
                position="bottom-left"
                theme="dark"
                className="select-none"
                toastClassName="!bg-default-200 transition-colors-opacity"
                bodyClassName="text-foreground transition-colors-opacity"
            />
        </div>
    );
}
