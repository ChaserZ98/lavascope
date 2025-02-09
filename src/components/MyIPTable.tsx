import { useCallback } from "react";

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
import { mdiContentCopy, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import { useAtomValue, useSetAtom } from "jotai";
import { toast } from "react-toastify";

import useFetch from "@/hooks/fetch";
import { Environment, environmentAtom } from "@/store/environment";
import {
    ipv4Atom,
    ipv6Atom,
    Version as IPVersion,
    refreshAtom,
} from "@/store/ip";
import { settingsAtom } from "@/store/settings";
import clipboard from "@/utils/clipboard";
import logging from "@/utils/log";
import ProxySwitch from "./ProxySwitch";

export default function MyIPTable() {
    const environment = useAtomValue(environmentAtom);
    const ipv4 = useAtomValue(ipv4Atom);
    const ipv6 = useAtomValue(ipv6Atom);
    const refreshIP = useSetAtom(refreshAtom);
    const settings = useAtomValue(settingsAtom);

    const fetchClient = useFetch(
        settings.useProxy
            ? {
                  proxy: {
                      http: settings.proxyAddress,
                      https: settings.proxyAddress,
                  },
              }
            : undefined
    );

    const refresh = useCallback(
        (version: IPVersion, fetchClient: typeof fetch) => {
            if (settings.useProxy && settings.proxyAddress === "") {
                toast.error(
                    <>
                        <p>Proxy address is not set.</p>
                        <p>Please set it in settings before using a proxy.</p>
                    </>
                );
                return;
            }
            refreshIP(version, fetchClient);
        },
        [settings]
    );

    const copy = useCallback((ip: string) => {
        clipboard
            .writeText(ip)
            .then(() =>
                toast.success("Copied to clipboard", {
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
                toast.error("Failed to copy to clipboard");
            });
    }, []);

    return (
        <div className="flex flex-col px-8 gap-4 items-center select-none">
            <h2 className="text-lg font-bold text-foreground transition-colors-opacity sm:text-2xl">
                My Public IP Addresses
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
                    <TableColumn align="center">Version</TableColumn>
                    <TableColumn align="center">Address</TableColumn>
                    <TableColumn align="center" width={64}>
                        Action
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
                                            content="Copy"
                                            delay={1000}
                                            closeDelay={100}
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
                                        content="Refresh"
                                        delay={1000}
                                        closeDelay={100}
                                    >
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            color="primary"
                                            className="text-default-400 transition-colors-opacity hover:text-primary-500"
                                            onPress={() =>
                                                refresh(version, fetchClient)
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
            {environment !== Environment.WEB && <ProxySwitch />}
        </div>
    );
}
