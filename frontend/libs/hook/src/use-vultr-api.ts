import { useFetch } from "@lavascope/hook";
import { VultrFirewall } from "@lavascope/store/firewlall";
import { VultrAPI } from "@lavascope/vultr";
import { useAtomValue } from "jotai";
import { useDeferredValue, useMemo } from "react";

function useVultrAPI() {
    const fetchClient = useFetch();
    const apiToken = useAtomValue(VultrFirewall.apiTokenAtom);

    const deferredApiToken = useDeferredValue(apiToken);

    const vultrAPI = useMemo(() => {
        return new VultrAPI({
            apiToken: deferredApiToken,
            fetchClient,
        });
    }, [deferredApiToken, fetchClient]);

    return vultrAPI;
}

export { useVultrAPI };
