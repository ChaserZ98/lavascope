import { showDevPanelAtom } from "@lavascope/store";
import { useAtomValue } from "jotai";
import { lazy, Suspense } from "react";

const DevTools = lazy(() => import("@tanstack/react-router-devtools").then((res) => ({ default: res.TanStackRouterDevtools })));

function TanStackRouterDevtools() {
    const showDevPanel = useAtomValue(showDevPanelAtom);

    if (!showDevPanel.tanStack) return null;

    return (
        <Suspense>
            <DevTools />
        </Suspense>
    );
}

export { TanStackRouterDevtools };
