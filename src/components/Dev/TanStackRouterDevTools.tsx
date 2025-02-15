import { useAtomValue } from "jotai";
import { lazy, Suspense } from "react";

import { showDevPanelAtom } from "@/store/settings";

export default function TanStackRouterDevtools() {
    const showDevPanel = useAtomValue(showDevPanelAtom);
    if (!showDevPanel.tanStack) return null;

    const Devtools =
        !import.meta.env.PROD && showDevPanel.tanStack
            ? lazy(() =>
                  import("@tanstack/router-devtools").then((res) => ({
                      default: res.TanStackRouterDevtools,
                  }))
              )
            : () => null;

    return (
        <Suspense>
            <Devtools />
        </Suspense>
    );
}
