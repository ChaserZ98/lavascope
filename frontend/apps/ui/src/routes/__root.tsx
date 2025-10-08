import "react-toastify/dist/ReactToastify.css";

import { HeroUIProvider } from "@heroui/react";
import {
    createRootRoute,
    type NavigateOptions,
    Outlet,
    type ToOptions,
    useRouter,
} from "@tanstack/react-router";

import { JotaiDevTools, TanStackRouterDevtools } from "@/components/Dev";

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

    return (
        <HeroUIProvider
            navigate={(to, options) => router.navigate({ to, ...options })}
            useHref={(to) => router.buildLocation({ to }).href}
        >
            <Outlet />
            <TanStackRouterDevtools />
            <JotaiDevTools />
        </HeroUIProvider>
    );
}
