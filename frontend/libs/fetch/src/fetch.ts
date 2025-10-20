import { isTauri } from "@tauri-apps/api/core";
import {
    type ClientOptions,
    fetch as tauriFetch,
} from "@tauri-apps/plugin-http";

export type LavaScopeFetch = typeof fetch | typeof tauriFetch;

export class ProxyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ProxyError";
    }
}

function createTauriFetch(clientOptions?: ClientOptions) {
    return (
        input: Parameters<typeof fetch>[0],
        init: Parameters<typeof fetch>[1]
    ) => {
        return tauriFetch(input, {
            ...clientOptions,
            ...init,
        });
    };
}
export function initFetch(clientOptions: ClientOptions): LavaScopeFetch {
    if (!isTauri()) return fetch;

    return createTauriFetch(clientOptions);
}
