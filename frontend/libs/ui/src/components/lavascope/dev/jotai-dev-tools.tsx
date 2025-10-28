import "jotai-devtools/styles.css";

import { showDevPanelAtom } from "@lavascope/store";
import { useAtomValue } from "jotai";
import { lazy, Suspense } from "react";

const DevTools = lazy(() =>
    import("jotai-devtools").then((res) => ({
        default: res.DevTools,
    }))
);

function JotaiDevTools() {
    const showDevPanel = useAtomValue(showDevPanelAtom);

    if (!showDevPanel.jotai) return null;

    return (
        <Suspense>
            <DevTools />
        </Suspense>
    );
}

export { JotaiDevTools };
