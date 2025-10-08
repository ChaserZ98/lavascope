import { isTauri } from "@tauri-apps/api/core";
import {
    type ClientOptions,
    fetch as tauriFetch,
} from "@tauri-apps/plugin-http";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

import { proxyAddressAtom, useProxyAtom } from "@/store/proxy";

export class ProxyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ProxyError";
    }
}

export default function useFetch() {
    const useProxy = useAtomValue(useProxyAtom);
    const proxyAddress = useAtomValue(proxyAddressAtom);

    const fetchMethod = useMemo(() => {
        if (!isTauri()) return fetch;

        const createTauriFetch = (clientOptions?: ClientOptions) => {
            return (
                input: Parameters<typeof fetch>[0],
                init: Parameters<typeof fetch>[1]
            ) => {
                if (useProxy && proxyAddress === "")
                    throw new ProxyError(
                        "Proxy is enabled but address is empty"
                    );

                return tauriFetch(input, {
                    ...clientOptions,
                    ...init,
                });
            };
        };

        return createTauriFetch({
            proxy: useProxy ?
                {
                    http: proxyAddress,
                    https: proxyAddress,
                } :
                undefined,
        });
    }, [useProxy, proxyAddress]);
    return fetchMethod;
}
