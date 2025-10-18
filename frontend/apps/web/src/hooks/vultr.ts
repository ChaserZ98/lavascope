import { useAtomValue } from "jotai";
import { useDeferredValue, useEffect, useRef } from "react";

import { VultrAPI } from "@/lib/vultr";
import { apiTokenAtom } from "@/store/firewall";

import useFetch from "./fetch";

export function useVultrAPI() {
    const fetchClient = useFetch();
    const apiToken = useAtomValue(apiTokenAtom);

    const deferredApiToken = useDeferredValue(apiToken);

    const vultrAPI = useRef<VultrAPI>(
        new VultrAPI({
            apiToken: deferredApiToken,
            fetchClient,
        })
    );

    useEffect(() => {
        vultrAPI.current.apiToken = deferredApiToken;
        vultrAPI.current.fetchClient = fetchClient;
    }, [deferredApiToken, fetchClient]);

    return vultrAPI.current;
}
