import { showDevPanelAtom } from "@lavascope/store";
import { useAtomValue } from "jotai";
import { lazy, Suspense } from "react";

export default function TanStackRouterDevtools() {
    const showDevPanel = useAtomValue(showDevPanelAtom);
    if (!showDevPanel.tanStack) return null;

    const Devtools =
        !import.meta.env.PROD && showDevPanel.tanStack ?
            lazy(() =>
                import("@tanstack/react-router-devtools").then((res) => ({
                    default: res.TanStackRouterDevtools,
                }))
            ) :
            () => null;

    return (
        <Suspense>
            <Devtools />
        </Suspense>
    );
}
