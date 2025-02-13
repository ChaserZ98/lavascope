import { useAtomValue } from "jotai";
import { lazy, Suspense } from "react";

import { showDevPanelAtom } from "@/store/settings";

const Devtools = import.meta.env.PROD
    ? () => null
    : lazy(() =>
          import("@tanstack/router-devtools").then((res) => ({
              default: res.TanStackRouterDevtools,
          }))
      );

export default function TanStackRouterDevtools() {
    const showDevPanel = useAtomValue(showDevPanelAtom);
    if (!showDevPanel.tanStack) return null;
    return (
        <Suspense>
            <Devtools />
        </Suspense>
    );
}
