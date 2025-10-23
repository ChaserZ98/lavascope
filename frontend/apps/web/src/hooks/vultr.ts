import { useFetch } from "@lavascope/hook";
import { VultrFirewall } from "@lavascope/store/firewlall";
import { useAtomValue } from "jotai";
import { useDeferredValue, useEffect, useRef } from "react";

import { VultrAPI } from "@/lib/vultr";

export function useVultrAPI() {
    const fetchClient = useFetch();
    const apiToken = useAtomValue(VultrFirewall.apiTokenAtom);

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
