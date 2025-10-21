import type { LavaScopeFetch } from "@lavascope/fetch";
import { useClipboard, useFetch } from "@lavascope/hook";
import logging from "@lavascope/log";
import {
    ipv4Atom,
    ipv4EndpointsAtom,
    ipv6Atom,
    ipv6EndpointsAtom,
    refreshAPI,
    setIPAtom,
    Version as IPVersion,
} from "@lavascope/store";
import { ProxySwitch } from "@lavascope/ui/components/lavascope/proxy-switch";
import { Button } from "@lavascope/ui/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@lavascope/ui/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@lavascope/ui/components/ui/tooltip";
import { Trans } from "@lingui/react/macro";
import { mdiCheck, mdiContentCopy, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import { useAtomValue, useSetAtom } from "jotai";
import { type ComponentProps, type MouseEventHandler, useCallback, useState } from "react";
import { toast } from "sonner";

function CopyButton({ onClick }: ComponentProps<typeof Button>) {
    const [copied, setCopied] = useState(false);

    const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>((e) => {
        onClick?.(e);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 3000);
    }, [onClick]);

    return (
        <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
                <Button
                    size="sm"
                    variant="default"
                    onClick={handleClick}
                    disabled={copied}
                    className="cursor-pointer"
                >
                    <Icon
                        path={copied ? mdiCheck : mdiContentCopy}
                        size={0.75}
                    />
                </Button>
            </TooltipTrigger>
            <TooltipContent className="select-none" color="primary">
                <Trans>Copy</Trans>
            </TooltipContent>
        </Tooltip>
    );
}

function RefreshButton({ onClick, disabled, loading }: ComponentProps<typeof Button> & { loading?: boolean }) {
    return (
        <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
                <Button
                    size="sm"
                    variant="default"
                    onClick={onClick}
                    disabled={disabled}
                    className="cursor-pointer"
                >
                    <Icon
                        path={mdiRefresh}
                        size={0.75}
                        className={loading ? "animate-spin" : ""}
                    />
                </Button>
            </TooltipTrigger>
            <TooltipContent className="select-none" color="primary">
                <Trans>Refresh</Trans>
            </TooltipContent>
        </Tooltip>
    );
}

function MyIPTable() {
    const ipv4 = useAtomValue(ipv4Atom);
    const ipv6 = useAtomValue(ipv6Atom);
    const ipv4Endpoints = useAtomValue(ipv4EndpointsAtom);
    const ipv6Endpoints = useAtomValue(ipv6EndpointsAtom);

    const setIP = useSetAtom(setIPAtom);

    const clipboard = useClipboard();

    const fetchClient = useFetch();

    const refresh = useCallback(
        async (
            version: IPVersion,
            endpoints: string[],
            fetchClient: LavaScopeFetch
        ) => {
            if (endpoints.length === 0) {
                toast.error(() => <Trans>No {version} endpoint is set</Trans>, { description: () => <Trans>Please add at least one {version} endpoint</Trans> });
                return;
            }
            setIP(version, {
                value: "",
                refreshing: true,
            });
            try {
                const res = await refreshAPI(version, endpoints, fetchClient);
                setIP(version, {
                    value: res.ip,
                    refreshing: false,
                });
                logging.info(
                    `Fetched ${version} address ${res.ip} from ${res.endpoint}`
                );
            } catch (err) {
                setIP(version, {
                    value: "",
                    refreshing: false,
                });
                if (err instanceof AggregateError) {
                    logging.error(
                        `All requests failed: ${(err as AggregateError).errors}`
                    );
                    toast.error(
                        () => <Trans>Failed to fetch {version} address</Trans>,
                        {
                            description: () => <Trans>All request to endpoints failed</Trans>
                        }
                    );
                } else {
                    logging.error(`Failed to fetch ${version} address: ${err}`);
                    toast.error(
                        () => <Trans>Failed to fetch {version} address</Trans>,
                        {
                            description: () => <Trans>Unknown error</Trans>
                        }
                    );
                }
            }
        },
        []
    );

    const copy = useCallback(async (ip: string) => {
        try {
            await clipboard.writeText(ip);
            toast.success(() => <Trans>Copied to clipboard</Trans>);
        } catch (err) {
            logging.error(`Failed to copy to clipboard: ${err}`);
            const message = err instanceof Error ? err.message : "Unknown error";
            toast.error(() => <Trans>Failed to copy to clipboard</Trans>, { description: message });
        }
    }, []);

    return (
        <div className="flex flex-col px-8 py-4 gap-4 items-center select-none">
            <h2 className="text-lg font-bold text-foreground transition-colors-opacity sm:text-2xl">
                <Trans>My Public IP Addresses</Trans>
            </h2>
            <div className="overflow-hidden rounded-lg border-2 w-full">
                <Table
                    aria-label="IP Table"
                    className="text-wrap"
                >
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center">
                                <Trans>Version</Trans>
                            </TableHead>
                            <TableHead className="text-center">
                                <Trans>Address</Trans>
                            </TableHead>
                            <TableHead className="text-center">
                                <Trans>Action</Trans>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.values(IPVersion).map((version) => (
                            <TableRow
                                key={version}
                                className={
                                    (version === IPVersion.V4 && ipv4.refreshing) ||
                                    (version === IPVersion.V6 && ipv6.refreshing) ?
                                        "animate-pulse" :
                                        ""
                                }
                            >
                                <TableCell className="text-foreground font-mono text-center">
                                    {version === IPVersion.V4 ? "IPv4" : "IPv6"}
                                </TableCell>
                                <TableCell className="text-foreground font-mono text-center">
                                    <span className="break-all">
                                        {version === IPVersion.V4 ?
                                            ipv4.refreshing ?
                                                "Refreshing..." :
                                                ipv4.value || "Unknown" :
                                            ipv6.refreshing ?
                                                "Refreshing..." :
                                                ipv6.value || "Unknown"}
                                    </span>
                                </TableCell>
                                <TableCell className="flex justify-center">
                                    <div className="flex w-21 items-center justify-end gap-2">
                                        {(
                                            (version === IPVersion.V4 && ipv4.value) ||
                                            (version === IPVersion.V6 && ipv6.value)
                                        ) &&
                                        (
                                            <CopyButton onClick={() => copy(
                                                version === IPVersion.V4 ? ipv4.value : ipv6.value
                                            )}
                                            />
                                        )}
                                        <RefreshButton
                                            onClick={() =>
                                                refresh(
                                                    version,
                                                    version === IPVersion.V4 ? ipv4Endpoints : ipv6Endpoints,
                                                    fetchClient
                                                )}
                                            disabled={
                                                (version === IPVersion.V4 && ipv4.refreshing) ||
                                                (version === IPVersion.V6 && ipv6.refreshing)
                                            }
                                            loading={
                                                (version === IPVersion.V4 && ipv4.refreshing) ||
                                                (version === IPVersion.V6 && ipv6.refreshing)
                                            }
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <ProxySwitch />
        </div>
    );
}

export { MyIPTable };
