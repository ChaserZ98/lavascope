import logging from "@lavascope/log";
import {
    addIPEndpointAtom,
    deleteIPEndpointAtom,
    ipv4EndpointStateAtom,
    ipv6EndpointStateAtom,
    resetIPEndpointsAtom,
    restoreIPEndpointsAtom,
    Version,
} from "@lavascope/store";
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tooltip, TooltipContent, TooltipTrigger } from "@lavascope/ui/components/ui";
import { Trans, useLingui } from "@lingui/react/macro";
import { mdiPlus, mdiTrashCan } from "@mdi/js";
import Icon from "@mdi/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface IPEndpointsTableProps {
    version: Version;
}

export default function IPEndpointsTable(props: IPEndpointsTableProps) {
    const { version } = props;
    const endpointState = useAtomValue(
        version === Version.V4 ? ipv4EndpointStateAtom : ipv6EndpointStateAtom
    );
    const endpoints = endpointState.endpoints;
    const shouldUpdateFromDB = endpointState.shouldUpdateFromDB;

    const resetEndpoints = useSetAtom(resetIPEndpointsAtom);
    const addEndpoint = useSetAtom(addIPEndpointAtom);
    const deleteEndpoints = useSetAtom(deleteIPEndpointAtom);
    const restoreEndpoints = useSetAtom(restoreIPEndpointsAtom);

    const [newEndpoint, setNewEndpoint] = useState<string>("");

    const { t } = useLingui();

    const onReset = useCallback(async (version: Version) => {
        try {
            await resetEndpoints(version);
            logging.info(`Reset ${version} endpoints`);
        } catch (err) {
            logging.error(`Failed to reset ${version} endpoints: ${err}`);
            const message =
                err instanceof Error ? err.message : "unknown error";
            toast.error(t`Failed to reset ${version} endpoints: ${message}`);
        }
    }, []);
    const onAdd = useCallback(
        async (version: Version, endpoint: string, endpoints: string[]) => {
            const value = endpoint.trim();
            if (value === "") {
                logging.warn(`Endpoint URL cannot be empty`);
                toast.warn(t`Endpoint URL cannot be empty`);
                return;
            }
            if (endpoints.includes(value)) {
                logging.warn(`Endpoint URL already exists`);
                toast.warn(t`Endpoint URL already exists`);
                return;
            }
            try {
                await addEndpoint(version, value);
                setNewEndpoint("");
                logging.info(`Added endpoint ${value} to ${version} endpoints`);
            } catch (err) {
                logging.error(
                    `Failed to add ${value} to ${version} endpoints: ${err}`
                );
                const message =
                    err instanceof Error ? err.message : "unknown error";
                toast.error(t`Failed to add endpoint URL: ${message}`);
            }
        },
        []
    );
    const onDelete = useCallback(async (version: Version, endpoint: string) => {
        logging.info(`Deleting ${version} endpoint ${endpoint}`);
        try {
            await deleteEndpoints(version, endpoint);
            logging.info(`Deleted ${version} endpoint ${endpoint}.`);
        } catch (err) {
            logging.error(
                `Failed to delete ${version} endpoint ${endpoint}: ${err}`
            );
            const message =
                err instanceof Error ? err.message : "unknown error";
            toast.error(
                t`Failed to delete the endpoint ${endpoint}: ${message}`
            );
        }
    }, []);

    useEffect(() => {
        if (shouldUpdateFromDB) {
            restoreEndpoints(version).catch((err: Error) => {
                logging.error(`Failed to restore ${version} endpoints: ${err}`);
                const message = err.message;
                toast.error(
                    t`Failed to restore ${version} endpoints: ${message}`
                );
            });
        }
    }, [shouldUpdateFromDB]);

    return (
        <div className="flex flex-col px-8 py-4 gap-4 items-center select-none">
            <h2 className="text-lg font-bold text-foreground transition-colors-opacity sm:text-2xl">
                {
                    version === Version.V4 ?
                        <Trans>IPv4 Endpoints</Trans> :
                        <Trans>IPv6 Endpoints</Trans>
                }
            </h2>
            <div className="overflow-hidden border-2 rounded-lg px-2 w-full">
                <Table
                    aria-label={
                        version === Version.V4 ?
                            t`IPv4 Endpoints` :
                            t`IPv6 Endpoints`
                    }
                    className="text-wrap"
                >
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center">
                                <Trans>URL</Trans>
                            </TableHead>
                            <TableHead className="text-center">
                                <Trans>Actions</Trans>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <Input
                                    placeholder={t`Enter endpoint URL here`}
                                    aria-label="Endpoint URL"
                                    value={newEndpoint}
                                    onChange={(e) => setNewEndpoint(e.target.value)}
                                />
                            </TableCell>
                            <TableCell>
                                <Tooltip delayDuration={500}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="default"
                                            color="primary"
                                            disabled={newEndpoint.length === 0}
                                            onClick={() => onAdd(version, newEndpoint, endpoints)}
                                        >
                                            <Icon path={mdiPlus} size={0.75} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <Trans>Add endpoint</Trans>
                                    </TooltipContent>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                        <>
                            {endpoints.map((endpoint, index) => (
                                <TableRow key={index}>
                                    <TableCell>{endpoint}</TableCell>
                                    <TableCell>
                                        <Tooltip delayDuration={500}>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    color="danger"
                                                    onClick={() => onDelete(version, endpoint)}
                                                >
                                                    <Icon
                                                        path={mdiTrashCan}
                                                        size={0.75}
                                                    />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <Trans>Delete</Trans>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </>
                    </TableBody>
                </Table>
            </div>
            <div className="flex gap-4 justify-center items-center flex-wrap">
                <Button onClick={() => onReset(version)}>
                    <Trans>Reset</Trans>
                </Button>
            </div>
        </div>
    );
}
