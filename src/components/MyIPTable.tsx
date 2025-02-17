import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip,
} from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { mdiContentCopy, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { toast } from "react-toastify";

import useFetch from "@/hooks/fetch";
import {
    ipv4Atom,
    ipv4EndpointsAtom,
    ipv6Atom,
    ipv6EndpointsAtom,
    refreshAPI,
    setIPAtom,
    Version as IPVersion,
} from "@/store/ip";
import { proxyAddressAtom, useProxyAtom } from "@/store/settings";
import clipboard from "@/utils/clipboard";
import logging from "@/utils/log";

import ProxySwitch from "./ProxySwitch";

export default function MyIPTable() {
    const ipv4 = useAtomValue(ipv4Atom);
    const ipv6 = useAtomValue(ipv6Atom);
    const ipv4Endpoints = useAtomValue(ipv4EndpointsAtom);
    const ipv6Endpoints = useAtomValue(ipv6EndpointsAtom);
    const useProxy = useAtomValue(useProxyAtom);
    const proxyAddress = useAtomValue(proxyAddressAtom);

    const setIP = useSetAtom(setIPAtom);

    const { t } = useLingui();

    const fetchClient = useFetch(
        useProxy
            ? {
                  proxy: {
                      http: proxyAddress,
                      https: proxyAddress,
                  },
              }
            : undefined
    );

    const refresh = useCallback(
        (
            version: IPVersion,
            endpoints: string[],
            fetchClient: typeof fetch,
            useProxy: boolean,
            proxyAddress: string
        ) => {
            if (endpoints.length === 0) {
                toast.error(
                    <>
                        <p>
                            <Trans>No {version} endpoint is set.</Trans>
                        </p>
                        <p>
                            <Trans>
                                Please add at least one {version} endpoint.
                            </Trans>
                        </p>
                    </>
                );
                return;
            }
            if (useProxy && proxyAddress === "") {
                toast.error(
                    <>
                        <p>
                            <Trans>Proxy address is not set.</Trans>
                        </p>
                        <p>
                            <Trans>
                                Please set it in settings before using a proxy.
                            </Trans>
                        </p>
                    </>
                );
                return;
            }
            setIP(version, {
                value: "",
                refreshing: true,
            });
            refreshAPI(version, endpoints, fetchClient)
                .then((res) => {
                    setIP(version, {
                        value: res.ip,
                        refreshing: false,
                    });
                    logging.info(
                        `Fetched ${version} address ${res.ip} from ${res.endpoint}`
                    );
                })
                .catch((err) => {
                    setIP(version, {
                        value: "",
                        refreshing: false,
                    });
                    logging.error(
                        `Failed to fetch ${version} address: ${
                            err.name === "AggregateError"
                                ? "All requests failed"
                                : err
                        }`
                    );
                    toast.error(t`Failed to fetch ${version} address.`);
                });
        },
        []
    );
    const copy = useCallback((ip: string) => {
        clipboard
            .writeText(ip)
            .then(() =>
                toast.success(t`Copied to clipboard`, {
                    autoClose: 1000,
                    hideProgressBar: true,
                    pauseOnHover: false,
                    pauseOnFocusLoss: false,
                    closeOnClick: false,
                    closeButton: false,
                })
            )
            .catch((e) => {
                logging.error(`Failed to copy to clipboard: ${e}`);
                toast.error(t`Failed to copy to clipboard`);
            });
    }, []);

    return (
        <div className="flex flex-col px-8 py-4 gap-4 items-center select-none">
            <h2 className="text-lg font-bold text-foreground transition-colors-opacity sm:text-2xl">
                <Trans>My Public IP Addresses</Trans>
            </h2>
            <Table
                aria-label="IP Table"
                className="text-wrap"
                classNames={{
                    wrapper: "transition-colors-opacity",
                    th: "transition-colors-opacity text-xs sm:text-sm",
                    td: "transition-colors-opacity text-sm sm:text-base",
                }}
            >
                <TableHeader>
                    <TableColumn align="center">
                        <Trans>Version</Trans>
                    </TableColumn>
                    <TableColumn align="center">
                        <Trans>Address</Trans>
                    </TableColumn>
                    <TableColumn align="center" width={64}>
                        <Trans>Action</Trans>
                    </TableColumn>
                </TableHeader>
                <TableBody>
                    {Object.values(IPVersion).map((version) => (
                        <TableRow
                            key={version}
                            className={
                                (version === IPVersion.V4 && ipv4.refreshing) ||
                                (version === IPVersion.V6 && ipv6.refreshing)
                                    ? "animate-pulse"
                                    : ""
                            }
                        >
                            <TableCell className="text-foreground font-mono">
                                {version === IPVersion.V4 ? "IPv4" : "IPv6"}
                            </TableCell>
                            <TableCell className="text-foreground font-mono">
                                <span className="break-all">
                                    {version === IPVersion.V4
                                        ? ipv4.refreshing
                                            ? "Refreshing..."
                                            : ipv4.value || "Unknown"
                                        : ipv6.refreshing
                                          ? "Refreshing..."
                                          : ipv6.value || "Unknown"}
                                </span>
                            </TableCell>
                            <TableCell className="sm:flex sm:justify-center">
                                <div className="flex w-[64px] items-center justify-end">
                                    {((version === IPVersion.V4 &&
                                        ipv4.value) ||
                                        (version === IPVersion.V6 &&
                                            ipv6.value)) && (
                                        <Tooltip
                                            delay={500}
                                            closeDelay={150}
                                            content={t`Copy`}
                                            size="sm"
                                            color="primary"
                                        >
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                color="primary"
                                                className="text-default-400 transition-colors-opacity hover:text-primary-500"
                                                onPress={() =>
                                                    copy(
                                                        version === IPVersion.V4
                                                            ? ipv4.value
                                                            : ipv6.value
                                                    )
                                                }
                                            >
                                                <Icon
                                                    path={mdiContentCopy}
                                                    size={0.75}
                                                    className="cursor-pointer"
                                                />
                                            </Button>
                                        </Tooltip>
                                    )}
                                    <Tooltip
                                        delay={500}
                                        closeDelay={150}
                                        content={t`Refresh`}
                                        size="sm"
                                        color="primary"
                                    >
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            color="primary"
                                            className="text-default-400 transition-colors-opacity hover:text-primary-500"
                                            onPress={() =>
                                                refresh(
                                                    version,
                                                    version === IPVersion.V4
                                                        ? ipv4Endpoints
                                                        : ipv6Endpoints,
                                                    fetchClient,
                                                    useProxy,
                                                    proxyAddress
                                                )
                                            }
                                            disabled={
                                                (version === IPVersion.V4 &&
                                                    ipv4.refreshing) ||
                                                (version === IPVersion.V6 &&
                                                    ipv6.refreshing)
                                            }
                                        >
                                            <Icon
                                                path={mdiRefresh}
                                                size={0.75}
                                                className={
                                                    (version === IPVersion.V4 &&
                                                        ipv4.refreshing) ||
                                                    (version === IPVersion.V6 &&
                                                        ipv6.refreshing)
                                                        ? "animate-spin"
                                                        : ""
                                                }
                                            />
                                        </Button>
                                    </Tooltip>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <ProxySwitch />
        </div>
    );
}
