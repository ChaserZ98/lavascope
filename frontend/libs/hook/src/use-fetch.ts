import { initFetch, type LavaScopeFetch } from "@lavascope/fetch";
import { proxyAddressAtom, useProxyAtom } from "@lavascope/store";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

export class ProxyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ProxyError";
    }
}

export function useFetch(): LavaScopeFetch {
    const useProxy = useAtomValue(useProxyAtom);
    const proxyAddress = useAtomValue(proxyAddressAtom);

    const fetchMethod = useMemo(() => {
        const clientOptions = {
            proxy: useProxy ?
                {
                    http: proxyAddress,
                    https: proxyAddress,
                } :
                undefined,
        };
        return initFetch(clientOptions);
        // if (!isTauri()) return fetch;

        // const createTauriFetch = (clientOptions?: ClientOptions) => {
        //     return (
        //         input: Parameters<typeof fetch>[0],
        //         init: Parameters<typeof fetch>[1]
        //     ) => {
        //         if (useProxy && proxyAddress === "")
        //             throw new ProxyError("Proxy is enabled but address is empty");

        //         return tauriFetch(input, {
        //             ...clientOptions,
        //             ...init,
        //         });
        //     };
        // };

        // return createTauriFetch({
        //     proxy: useProxy ?
        //         {
        //             http: proxyAddress,
        //             https: proxyAddress,
        //         } :
        //         undefined,
        // });
    }, [useProxy, proxyAddress]);

    return fetchMethod;
}
