import "react-toastify/dist/ReactToastify.css";

import {
    createRootRoute,
    Outlet,
} from "@tanstack/react-router";

import { JotaiDevTools, TanStackRouterDevtools } from "@/components/Dev";

export const Route = createRootRoute({
    component: App,
});

function App() {
    return (
        <>
            <Outlet />
            <TanStackRouterDevtools />
            <JotaiDevTools />
        </>
    );
}
