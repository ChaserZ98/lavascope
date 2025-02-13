import { useAtomValue } from "jotai";
import { DevTools } from "jotai-devtools";

import { showDevPanelAtom } from "@/store/settings";

if (!import.meta.env.PROD) {
    import("jotai-devtools/styles.css");
}

export default function JotaiDevTools() {
    const showDevPanel = useAtomValue(showDevPanelAtom);
    if (!showDevPanel.jotai) return null;
    return <DevTools />;
}
