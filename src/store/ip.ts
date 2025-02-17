import { atom } from "jotai";

import logging from "@/utils/log";

const IPv4Endpoints = [
    "https://api.ipify.org",
    "https://ipv4.seeip.org",
    "https://ipv4.ip.sb",
    "https://4.ipw.cn",
];
const IPv6Endpoints = [
    "https://api6.ipify.org",
    "https://ipv6.seeip.org",
    "https://ipv6.ip.sb",
    "https://6.ipw.cn",
];

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

export const refreshAPI = (
    version: Version,
    endpoints: string[],
    fetchClient: typeof fetch,
    timeout: number = 5000
) => {
    const exclusiveAbortController = new AbortController();
    const tasks = endpoints.map((endpoint) => {
        logging.info(`Fetching ${version} address from ${endpoint}.`);
        const timeoutSignal = AbortSignal.timeout(timeout);
        const mergedSignal = AbortSignal.any([
            exclusiveAbortController.signal,
            timeoutSignal,
        ]);

        return fetchClient(endpoint, { signal: mergedSignal })
            .then((response) => {
                if (response.ok) return response.text();
                throw new Error(`Failed to fetch ${version} address.`);
            })
            .then((ip) => {
                exclusiveAbortController.abort(
                    "Request aborted due to other successful request"
                );
                return { ip, endpoint };
            })
            .catch((error) => {
                if (timeoutSignal.aborted) {
                    logging.info(
                        `${endpoint} aborted: ${timeoutSignal.reason}`
                    );
                } else if (exclusiveAbortController.signal.aborted) {
                    logging.info(
                        `${endpoint} aborted: ${exclusiveAbortController.signal.reason}`
                    );
                } else {
                    logging.warn(`${endpoint} failed: ${error}`);
                }
                throw error;
            });
    });

    return Promise.any(tasks);
};

function createInitialIPEndpoints(version: Version) {
    let endpoints = version === Version.V4 ? IPv4Endpoints : IPv6Endpoints;
    const stored = localStorage.getItem(`${version}_endpiont`);
    if (stored) {
        try {
            const storedEndpoints = JSON.parse(stored);
            if (Array.isArray(storedEndpoints)) {
                endpoints = storedEndpoints;
            }
        } catch (e) {
            logging.info(`Failed to parse stored endpoints: ${e}`);
            logging.info(`Using default endpoints instead`);
        }
    }
    return endpoints;
}

export const ipv4EndpointsAtom = atom(createInitialIPEndpoints(Version.V4));
export const ipv6EndpointsAtom = atom(createInitialIPEndpoints(Version.V6));

export const addIPEndpointAtom = atom(
    null,
    (_get, set, version: Version, endpoint: string) => {
        const atom =
            version === Version.V4 ? ipv4EndpointsAtom : ipv6EndpointsAtom;
        set(atom, (prev) => {
            const newEndpoints = [...prev, endpoint];
            localStorage.setItem(
                `${version}_endpiont`,
                JSON.stringify(newEndpoints)
            );
            return newEndpoints;
        });
    }
);
export const deleteIPEndpointAtom = atom(
    null,
    (_get, set, version: Version, endpoint: string) => {
        const atom =
            version === Version.V4 ? ipv4EndpointsAtom : ipv6EndpointsAtom;
        set(atom, (prev) => {
            const newEndpoints = prev.filter((e) => e !== endpoint);
            localStorage.setItem(
                `${version}_endpiont`,
                JSON.stringify(newEndpoints)
            );
            return newEndpoints;
        });
    }
);
export const resetIPEndpointsAtom = atom(
    null,
    (_get, set, version: Version) => {
        set(
            version === Version.V4 ? ipv4EndpointsAtom : ipv6EndpointsAtom,
            () => {
                const endpoints =
                    version === Version.V4 ? IPv4Endpoints : IPv6Endpoints;
                localStorage.setItem(
                    `${version}_endpiont`,
                    JSON.stringify(endpoints)
                );
                return endpoints;
            }
        );
    }
);
