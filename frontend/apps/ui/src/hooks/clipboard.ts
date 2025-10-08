import { readText, writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

import { Platform, platformAtom } from "@/store/environment";

type Clipboard = {
    writeText: (text: string) => Promise<void>;
    readText: () => Promise<string>;
};

export default function useClipboard() {
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
                writeText: navigator.clipboard.writeText,
                readText: navigator.clipboard.readText,
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
