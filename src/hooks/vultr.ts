import { useAtomValue } from "jotai";
import { useDeferredValue, useMemo } from "react";

import { VultrAPI } from "@/lib/vultr";
import { apiTokenAtom } from "@/store/firewall/firewall";

import useFetch from "./fetch";

export function useVultrAPI() {
    const fetchClient = useFetch();
    const apiToken = useAtomValue(apiTokenAtom);

    const deferredApiToken = useDeferredValue(apiToken);

    const vultrAPI = useMemo(
        () =>
            new VultrAPI({
                apiToken: deferredApiToken,
                fetchClient,
            }),
        [fetchClient, deferredApiToken]
    );

    return vultrAPI;
}
