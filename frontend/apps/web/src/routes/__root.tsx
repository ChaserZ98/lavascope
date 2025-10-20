import "react-toastify/dist/ReactToastify.css";

import { JotaiDevTools } from "@lavascope/ui/components/lavascope/dev/jotai-dev-tools";
import { TanStackRouterDevtools } from "@lavascope/ui/components/lavascope/dev/tanstack-router-dev-tools";
import {
    createRootRoute,
    Outlet,
} from "@tanstack/react-router";

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
