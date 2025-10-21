import { Platform, platformAtom } from "@lavascope/store";
import { readText, writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

type Clipboard = {
    writeText: typeof writeText | typeof navigator.clipboard.writeText;
    readText: () => Promise<string>;
};

function useClipboard() {
    const platform = useAtomValue(platformAtom);

    const clipboard = useMemo<Clipboard>(() => {
        if (platform !== Platform.WEB) {
            return {
                writeText,
                readText,
            };
        }

        if (window.isSecureContext) {
            return {
                writeText: async (text: string) => await navigator.clipboard.writeText(text),
                readText: async () => await navigator.clipboard.readText(),
            };
        }

        return {
            writeText: async () => {
                throw new Error(
                    "Clipboard API is not available in insecure contexts"
                );
            },
            readText: async () => {
                throw new Error(
                    "Clipboard API is not available in insecure contexts"
                );
            },
        };
    }, [platform]);

    return clipboard;
}

export { type Clipboard, useClipboard };
