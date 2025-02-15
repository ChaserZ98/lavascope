import { useAtomValue } from "jotai";
import { lazy, Suspense } from "react";

import { showDevPanelAtom } from "@/store/settings";

if (!import.meta.env.PROD) {
    import("jotai-devtools/styles.css");
}

export default function JotaiDevTools() {
    const showDevPanel = useAtomValue(showDevPanelAtom);
    if (!showDevPanel.jotai) return null;

    const DevTools =
        !import.meta.env.PROD && showDevPanel.jotai
            ? lazy(() =>
                  import("jotai-devtools").then((res) => ({
                      default: res.DevTools,
                  }))
              )
            : () => null;

    return (
        <Suspense>
            <DevTools />
        </Suspense>
    );
}
