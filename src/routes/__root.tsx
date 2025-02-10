import "react-toastify/dist/ReactToastify.css";

import { HeroUIProvider } from "@heroui/react";
import {
    createRootRoute,
    type NavigateOptions,
    Outlet,
    type ToOptions,
    useRouter,
} from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { lazy, Suspense, useEffect } from "react";
import { ToastContainer } from "react-toastify";

import Navbar from "@/components/Navbar";
import TauriTitleBar from "@/components/TauriTitleBar";
import { addScreenSizeListener, screenSizeAtom } from "@/store/screen";
import checkCompatibility from "@/utils/compatibility";

export const Route = createRootRoute({
    component: App,
});

declare module "@react-types/shared" {
    interface RouterConfig {
        href: ToOptions["to"];
        routerOptions: Omit<NavigateOptions, keyof ToOptions>;
    }
}

const TanStackRouterDevtools = import.meta.env.PROD
    ? () => null
    : lazy(() =>
          import("@tanstack/router-devtools").then((res) => ({
              default: res.TanStackRouterDevtools,
          }))
      );

function App() {
    const router = useRouter();
    const setScreenSize = useSetAtom(screenSizeAtom);

    useEffect(() => {
        checkCompatibility();
        const removeScreenSizeListener = addScreenSizeListener(setScreenSize);
        return () => removeScreenSizeListener();
    }, []);

    return (
        <HeroUIProvider
            navigate={(to, options) => router.navigate({ to, ...options })}
            useHref={(to) => router.buildLocation({ to }).href}
        >
            <div className="flex flex-col w-full h-screen">
                <div className="w-full sticky top-0">
                    <TauriTitleBar />
                    <Navbar />
                </div>
                <div className="flex-1 overflow-auto ">
                    <Outlet />
                </div>
                <ToastContainer
                    position="bottom-left"
                    theme="dark"
                    className="select-none"
                    toastClassName="!bg-default-200 transition-colors-opacity"
                    bodyClassName="text-foreground transition-colors-opacity"
                />
            </div>
            <Suspense>
                <TanStackRouterDevtools />
            </Suspense>
        </HeroUIProvider>
    );
}
