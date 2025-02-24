import "react-toastify/dist/ReactToastify.css";

import { HeroUIProvider } from "@heroui/react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import {
    createRootRoute,
    type NavigateOptions,
    Outlet,
    type ToOptions,
    useRouter,
} from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";

import JotaiDevTools from "@/components/Dev/JotaiDevTools";
import TanStackRouterDevtools from "@/components/Dev/TanStackRouterDevTools";
import { BottomNavigation, Navigation } from "@/components/Navbar";
import TauriTitleBar from "@/components/TauriTitleBar";
import { platformAtom } from "@/store/environment";
import { languageAtom } from "@/store/language";
import { addScreenSizeListener, screenSizeAtom } from "@/store/screen";
import checkCompatibility from "@/utils/compatibility";
import { dynamicActivate } from "@/utils/i18n";

export const Route = createRootRoute({
    component: App,
});

declare module "@react-types/shared" {
    interface RouterConfig {
        href: ToOptions["to"];
        routerOptions: Omit<NavigateOptions, keyof ToOptions>;
    }
}

function App() {
    const router = useRouter();

    const platform = useAtomValue(platformAtom);
    const language = useAtomValue(languageAtom);

    const setScreenSize = useSetAtom(screenSizeAtom);

    useEffect(() => {
        dynamicActivate(language);
        checkCompatibility(platform);
        const removeScreenSizeListener = addScreenSizeListener(setScreenSize);
        return () => removeScreenSizeListener();
    }, []);

    return (
        <I18nProvider i18n={i18n}>
            <HeroUIProvider
                navigate={(to, options) => router.navigate({ to, ...options })}
                useHref={(to) => router.buildLocation({ to }).href}
            >
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
                <TanStackRouterDevtools />
                <JotaiDevTools />
            </HeroUIProvider>
        </I18nProvider>
    );
}
