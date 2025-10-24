import type { LavaScopeFetch } from "@lavascope/fetch";

import type {
    ICreateGroupParams,
    ICreateGroupResponse,
    ICreateRuleParams,
    ICreateRuleResponse,
    IDeleteGroupParams,
    IDeleteRuleParams,
    IGetGroupParams,
    IGetGroupResponse,
    IGetRuleParams,
    IGetRuleResponse,
    IListGroupsParams,
    IListGroupsResponse,
    IListRulesParams,
    IListRulesResponse,
    IUpdateGroupParams,
} from "./api/firewall";
import firewallEndpoint from "./api/firewall";
import { ErrorResponse, RequestError } from "./error";
import type { Endpoint, IParams, IVultrAPI } from "./types";

export class VultrAPI implements IVultrAPI {
    apiToken: string;
    fetchClient: LavaScopeFetch;
    baseUrl: string;
    timeout: number;

    constructor(props?: {
        apiToken?: string;
        fetchClient?: LavaScopeFetch;
        baseUrl?: string;
        timeout?: number;
    }) {
        this.apiToken = props?.apiToken || "";
        this.fetchClient = props?.fetchClient || fetch;
        this.baseUrl = props?.baseUrl || "https://api.vultr.com/v2";
        this.timeout = props?.timeout || 5000;
    }

    private createRequestFunction<PType extends IParams, RType = void>(
        endpoint: Endpoint
    ): (parameters?: PType) => Promise<RType> {
        return (parameters) => {
            // Check if the endpoint requires an API key
            if (endpoint.apiKeyRequired) {
                if (!this.apiToken) {
                    // API key was not provided
                    throw new RequestError(
                        `API key required for ${endpoint.url}`
                    );
                }
            }

            // Check if the endpoint has parameters specified
            if (!endpoint.parameters) {
                return this.makeApiRequest(endpoint);
            }

            if (!parameters) {
                // No parameters passed, check that none are required
                for (const endpointParameter in endpoint.parameters) {
                    if (endpoint.parameters[endpointParameter]?.required) {
                        throw new RequestError(
                            `Missing parameter: ${endpointParameter}`
                        );
                    }
                }
                return this.makeApiRequest(endpoint);
            }

            if (typeof parameters !== "object") {
                // Parameters were not passed in as an object
                throw new RequestError(
                    "Parameters must be passed in as an object."
                );
            }
            // Validate the parameters the user passed in
            const requestParameters: Record<string, unknown> = {};

            for (const parameter in endpoint.parameters) {
                const endpointParameter = endpoint.parameters[parameter];
                const userParameter = parameters[parameter];

                if (
                    endpointParameter?.required &&
                    typeof userParameter === "undefined"
                ) {
                    // Parameters for the request are required, but none were passed in
                    throw new RequestError(`Missing parameter: ${parameter}`);
                }
                if (userParameter !== undefined) {
                    if (
                        endpointParameter?.type === "array" &&
                        !Array.isArray(userParameter)
                    ) {
                        // Request requires array but array was not passed in
                        throw new RequestError(
                            `Invalid parameter type for ${parameter}, expected ${endpointParameter.type}`
                        );
                    }
                    if (
                        endpointParameter?.type === "number" &&
                        isNaN(Number(userParameter))
                    ) {
                        // Request requires a number but special character or alpha character was passed in
                        throw new RequestError(
                            `Invalid parameter type for ${parameter}, expected ${endpointParameter.type}`
                        );
                    }
                    if (
                        endpointParameter?.type !== "array" &&
                        endpointParameter?.type !== "number" &&
                        typeof userParameter !== endpointParameter?.type
                    ) {
                        // Request parameter type does not match the parameter type that was passed in
                        throw new RequestError(
                            `Invalid parameter type for ${parameter}, expected ${endpointParameter?.type}`
                        );
                    }
                    // Parameters successfully validated
                    requestParameters[parameter] = userParameter;
                }
            }
            // All options are validated, return a function to call the endpoint
            return this.makeApiRequest<RType>(endpoint, requestParameters);
        };
    }

    private makeApiRequest<RType>(
        endpoint: Endpoint,
        requestParameters?: Record<string, unknown>
    ) {
        const fetchUrl = new URL(`${this.baseUrl}${endpoint.url}`);
        const options: RequestInit = {
            method: endpoint.requestType,
            headers: {
                Authorization: this.apiToken ? `Bearer ${this.apiToken}` : "",
            },
            signal: AbortSignal.timeout(this.timeout),
        };

        const { requestType, parameters: endpointParameters } = endpoint;

        if (endpointParameters && requestParameters) {
            // Replace path parameters in the URL
            Object.keys(requestParameters)
                .filter((key) => endpointParameters[key]?.path)
                .forEach((param) => {
                    fetchUrl.pathname = fetchUrl.pathname.replace(
                        encodeURIComponent(`{${param}}`),
                        requestParameters[param] as string
                    );
                });

            if (requestType === "POST") {
                options.body = JSON.stringify(requestParameters);
                options.headers = {
                    ...options.headers,
                    "Content-Type": "application/json",
                };
            } else if (
                requestType === "GET" ||
                requestType === "DELETE" ||
                requestType === "OPTIONS"
            ) {
                Object.keys(requestParameters)
                    .filter((key) => !endpointParameters[key]?.path)
                    .forEach((key) => {
                        fetchUrl.searchParams.append(
                            key,
                            encodeURIComponent(requestParameters[key] as string)
                        );
                    });
            } else if (requestType === "PUT" || requestType === "PATCH") {
                const bodyParams = Object.keys(requestParameters)
                    .filter((key) => !endpointParameters[key]?.path)
                    .reduce(
                        (acc, key) => {
                            acc[key] = requestParameters[key] as string;
                            return acc;
                        },
                        {} as Record<string, string>
                    );
                options.body = JSON.stringify(bodyParams);
                options.headers = {
                    ...options.headers,
                    "Content-Type": "application/json",
                };
            }
        }

        return this.fetchClient(fetchUrl, options).then((response) => {
            if (!response.ok) {
                return response
                    .json()
                    .catch(() => {
                        throw new ErrorResponse(
                            response.status,
                            response.statusText
                        );
                    })
                    .then((json: { error?: string }) => {
                        if (json.error) {
                            throw new ErrorResponse(
                                response.status,
                                json.error
                            );
                        }
                        throw new ErrorResponse(
                            response.status,
                            response.statusText
                        );
                    });
            }
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                return undefined as RType;
            }
            return response.json().then((json) => json as RType);
        });
    }

    /**
     * @description Vultr Firewall API
     * @returns Firewall API functions
     * @throws {RequestError} If the user's request is invalid
     * @throws {ResponseError} If the API returns an error response
     */
    public get firewall() {
        return {
            listGroups: this.createRequestFunction<
                IListGroupsParams,
                IListGroupsResponse
            >(firewallEndpoint.listGroups),
            createGroup: this.createRequestFunction<
                ICreateGroupParams,
                ICreateGroupResponse
            >(firewallEndpoint.createGroup),
            getGroup: this.createRequestFunction<
                IGetGroupParams,
                IGetGroupResponse
            >(firewallEndpoint.getGroup),
            updateGroup: this.createRequestFunction<IUpdateGroupParams>(
                firewallEndpoint.updateGroup
            ),
            deleteGroup: this.createRequestFunction<IDeleteGroupParams>(
                firewallEndpoint.deleteGroup
            ),
            listRules: this.createRequestFunction<
                IListRulesParams,
                IListRulesResponse
            >(firewallEndpoint.listRules),
            createRule: this.createRequestFunction<
                ICreateRuleParams,
                ICreateRuleResponse
            >(firewallEndpoint.createRule),
            deleteRule: this.createRequestFunction<IDeleteRuleParams>(
                firewallEndpoint.deleteRule
            ),
            getRule: this.createRequestFunction<
                IGetRuleParams,
                IGetRuleResponse
            >(firewallEndpoint.getRule),
        };
    }
}
