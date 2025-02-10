import { atom } from "jotai";
import { toast } from "react-toastify";

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

export const refreshAtom = atom(
    null,
    (
        _get,
        set,
        version: Version,
        fetchClient: typeof fetch,
        timeout: number = 5000
    ) => {
        const endpoints =
            version === Version.V4 ? IPv4Endpoints : IPv6Endpoints;
        const ipAtom = version === Version.V4 ? ipv4Atom : ipv6Atom;
        set(ipAtom, {
            value: "",
            refreshing: true,
        });

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

        Promise.any(tasks)
            .then((res) => {
                set(ipAtom, {
                    value: res.ip,
                    refreshing: false,
                });
                localStorage.setItem(`ip${version}`, res.ip);
                logging.info(
                    `Fetched ${version} address ${res.ip} from ${res.endpoint}`
                );
            })
            .catch((err) => {
                set(ipAtom, {
                    value: "",
                    refreshing: false,
                });
                localStorage.removeItem(`ip${version}`);
                logging.error(
                    `Failed to fetch ${version} address: ${
                        err.name === "AggregateError"
                            ? "All requests failed"
                            : err
                    }`
                );
                toast.error(`Failed to fetch ${version} address.`);
            });
    }
);

export const ipv4EndpointsAtom = atom(IPv4Endpoints);
export const ipv6EndpointsAtom = atom(IPv6Endpoints);

export const addIPv4EndpointAtom = atom(null, (_get, set, endpoint: string) => {
    set(ipv4EndpointsAtom, (prev) => [...prev, endpoint]);
});
export const deleteIPv4EndpointAtom = atom(
    null,
    (_get, set, endpoint: string) => {
        set(ipv4EndpointsAtom, (prev) => prev.filter((e) => e !== endpoint));
    }
);
export const resetIPv4EndpointsAtom = atom(null, (_get, set) => {
    set(ipv4EndpointsAtom, IPv4Endpoints);
});

export const addIPv6EndpointAtom = atom(null, (_get, set, endpoint: string) => {
    set(ipv6EndpointsAtom, (prev) => [...prev, endpoint]);
});
export const deleteIPv6EndpointAtom = atom(
    null,
    (_get, set, endpoint: string) => {
        set(ipv6EndpointsAtom, (prev) => prev.filter((e) => e !== endpoint));
    }
);
export const resetIPv6EndpointsAtom = atom(null, (_get, set) => {
    set(ipv6EndpointsAtom, IPv6Endpoints);
});
