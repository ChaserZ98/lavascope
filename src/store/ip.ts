import { atom } from "jotai";
import { atomWithImmer } from "jotai-immer";

import { db } from "@/db";
import logging from "@/utils/log";

export enum Version {
    V4 = "v4",
    V6 = "v6",
}

type IPState = {
    value: string;
    refreshing: boolean;
};
const createIPAtoms = (version: Version) =>
    atom<IPState>({
        value: localStorage.getItem(`ip${version}`) || "",
        refreshing: false,
    });

export const ipv4Atom = createIPAtoms(Version.V4);
export const ipv6Atom = createIPAtoms(Version.V6);

export const setIPAtom = atom(
    null,
    (_get, set, version: Version, ip: IPState) => {
        const ipAtom = version === Version.V4 ? ipv4Atom : ipv6Atom;
        set(ipAtom, ip);
        localStorage.setItem(`ip${version}`, ip.value);
    }
);

export const refreshAPI = async (
    version: Version,
    endpoints: string[],
    fetchClient: typeof fetch,
    timeout: number = 5000
) => {
    const exclusiveAbortController = new AbortController();
    const tasks = endpoints.map(async (endpoint) => {
        logging.info(`Fetching ${version} address from ${endpoint}.`);
        const timeoutSignal = AbortSignal.timeout(timeout);
        const mergedSignal = AbortSignal.any([
            exclusiveAbortController.signal,
            timeoutSignal,
        ]);
        try {
            const res = await fetchClient(endpoint, { signal: mergedSignal });
            if (!res.ok) {
                throw new Error(`${res.status}: ${res.statusText}`);
            }
            const ip = await res.text();
            exclusiveAbortController.abort(
                "Request aborted due to other successful request"
            );
            return { ip, endpoint };
        } catch (err) {
            if (timeoutSignal.aborted) {
                throw new Error(
                    `${endpoint} timed out: ${timeoutSignal.reason}`
                );
            } else if (exclusiveAbortController.signal.aborted) {
                throw new Error(
                    `${endpoint} aborted: ${exclusiveAbortController.signal.reason}`
                );
            }
            throw err;
        }
    });

    return await Promise.any(tasks);
};

const defaultIPv4Endpoints = [
    "https://api.ipify.org",
    "https://ipv4.seeip.org",
    "https://ipv4.ip.sb",
    "https://4.ipw.cn",
];
const defaultIPv6Endpoints = [
    "https://api6.ipify.org",
    "https://ipv6.seeip.org",
    "https://ipv6.ip.sb",
    "https://6.ipw.cn",
];

type EndpointState = {
    endpoints: string[];
    shouldUpdateFromDB: boolean;
};
export const ipv4EndpointStateAtom = atomWithImmer<EndpointState>({
    endpoints: defaultIPv4Endpoints,
    shouldUpdateFromDB: true,
});
export const ipv4EndpointsAtom = atom(
    (get) => get(ipv4EndpointStateAtom).endpoints
);

export const ipv6EndpointStateAtom = atomWithImmer<EndpointState>({
    endpoints: defaultIPv6Endpoints,
    shouldUpdateFromDB: true,
});
export const ipv6EndpointsAtom = atom(
    (get) => get(ipv6EndpointStateAtom).endpoints
);

export const addIPEndpointAtom = atom(
    null,
    async (_get, set, version: Version, endpoint: string) => {
        const atom =
            version === Version.V4
                ? ipv4EndpointStateAtom
                : ipv6EndpointStateAtom;
        await db.endpoints.add({ ip_type: version, endpoint });
        set(atom, (state) => {
            state.endpoints.push(endpoint);
        });
    }
);
export const deleteIPEndpointAtom = atom(
    null,
    async (_get, set, version: Version, endpoint: string) => {
        const atom =
            version === Version.V4
                ? ipv4EndpointStateAtom
                : ipv6EndpointStateAtom;
        await db.endpoints.where({ ip_type: version, endpoint }).delete();
        set(atom, (state) => {
            state.endpoints = state.endpoints.filter((e) => e !== endpoint);
        });
    }
);
export const resetIPEndpointsAtom = atom(
    null,
    async (_get, set, version: Version) => {
        const atom =
            version === Version.V4
                ? ipv4EndpointStateAtom
                : ipv6EndpointStateAtom;
        const endpoints =
            version === Version.V4
                ? defaultIPv4Endpoints
                : defaultIPv6Endpoints;
        await db.endpoints.where({ ip_type: version }).delete();
        await db.endpoints.bulkPut(
            endpoints.map((endpoint) => ({
                ip_type: version,
                endpoint,
            }))
        );
        set(atom, (state) => {
            state.endpoints = endpoints;
        });
    }
);
