import logging from "@lavascope/log";
import {
    addIPEndpointAtom,
    deleteIPEndpointAtom,
    ipv4EndpointStateAtom,
    ipv6EndpointStateAtom,
    IPVersion,
    resetIPEndpointsAtom,
    restoreIPEndpointsAtom,
} from "@lavascope/store";
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tooltip, TooltipContent, TooltipTrigger } from "@lavascope/ui/components/ui";
import { Trans, useLingui } from "@lingui/react/macro";
import { mdiPlus, mdiTrashCan } from "@mdi/js";
import Icon from "@mdi/react";
import { useAtomValue, useSetAtom } from "jotai";
import { type ChangeEventHandler, type ComponentProps, type KeyboardEventHandler, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function AddButton({ onClick, disabled }: ComponentProps<typeof Button>) {
    return (
        <Tooltip delayDuration={500}>
            <TooltipTrigger asChild className="cursor-pointer">
                <Button
                    size="sm"
                    variant="default"
                    color="primary"
                    disabled={disabled}
                    onClick={onClick}
                >
                    <Icon path={mdiPlus} size={0.75} />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <Trans>Add endpoint</Trans>
            </TooltipContent>
        </Tooltip>
    );
}

function DeleteButton({ onClick }: ComponentProps<typeof Button>) {
    return (
        <Tooltip delayDuration={500}>
            <TooltipTrigger asChild className="cursor-pointer">
                <Button
                    size="sm"
                    variant="destructive"
                    color="danger"
                    onClick={onClick}
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
    );
}

function validateURL(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

interface IPEndpointsTableProps {
    version: IPVersion;
}

function IPEndpointsTable({ version }: IPEndpointsTableProps) {
    const endpointState = useAtomValue(
        version === IPVersion.V4 ? ipv4EndpointStateAtom : ipv6EndpointStateAtom
    );
    const endpoints = endpointState.endpoints;
    const shouldUpdateFromDB = endpointState.shouldUpdateFromDB;

    const resetEndpoints = useSetAtom(resetIPEndpointsAtom);
    const addEndpoint = useSetAtom(addIPEndpointAtom);
    const deleteEndpoints = useSetAtom(deleteIPEndpointAtom);
    const restoreEndpoints = useSetAtom(restoreIPEndpointsAtom);

    const [newEndpoint, setNewEndpoint] = useState<string>("");

    const { t } = useLingui();

    const onReset = useCallback(async (version: IPVersion) => {
        try {
            await resetEndpoints(version);
            logging.info(`Reset ${version} endpoints`);
        } catch (err) {
            logging.error(`Failed to reset ${version} endpoints: ${err}`);
            const message = err instanceof Error ? err.message : "Unknown error";
            toast.error(() => <Trans>Failed to reset {version} endpoints</Trans>, { description: message });
        }
    }, []);

    const onAdd = useCallback(async (version: IPVersion, endpoint: string, endpoints: string[]) => {
        const value = endpoint.trim();
        if (value === "") {
            logging.warn(`Endpoint URL cannot be empty`);
            toast.warning(() => <Trans>Endpoint URL cannot be empty</Trans>);
            return;
        }
        if (!validateURL(value)) {
            logging.warn(`${value} is not a valid URL`);
            toast.warning(() => <Trans>{value} is not a valid URL</Trans>);
            return;
        }
        if (endpoints.includes(value)) {
            logging.warn(`Endpoint URL already exists`);
            toast.warning(() => <Trans>Endpoint URL already exists</Trans>);
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
            const message = err instanceof Error ? err.message : "Unknown error";
            toast.error(() => <Trans>Failed to add endpoint URL</Trans>, { description: message });
        }
    }, []);

    const onDelete = useCallback(async (version: IPVersion, endpoint: string) => {
        logging.info(`Deleting ${version} endpoint ${endpoint}`);
        try {
            await deleteEndpoints(version, endpoint);
            logging.info(`Deleted ${version} endpoint ${endpoint}.`);
        } catch (err) {
            logging.error(
                `Failed to delete ${version} endpoint ${endpoint}: ${err}`
            );
            const message = err instanceof Error ? err.message : "Unknown error";
            toast.error(() => <Trans>Failed to delete the endpoint {endpoint}</Trans>, { description: message });
        }
    }, []);

    const handleNewEndpointInput = useCallback<ChangeEventHandler<HTMLInputElement>>((e) => {
        setNewEndpoint(e.target.value);
    }, []);

    const handleNewEndpointInputSubmit = useCallback<KeyboardEventHandler<HTMLInputElement>>((e) => {
        if (e.key !== "Enter") return;
        onAdd(version, newEndpoint, endpoints);
    }, [version, newEndpoint, endpoints]);

    useEffect(() => {
        if (shouldUpdateFromDB) {
            restoreEndpoints(version).catch((err: Error) => {
                logging.error(`Failed to restore ${version} endpoints: ${err}`);
                const message = err.message;
                toast.error(() => <Trans>Failed to restore {version} endpoints</Trans>, { description: message });
            });
        }
    }, [shouldUpdateFromDB]);

    return (
        <div className="flex flex-col px-8 py-4 gap-4 items-center select-none">
            <h2 className="text-lg font-bold text-foreground transition-colors-opacity sm:text-2xl">
                {
                    version === IPVersion.V4 ?
                        <Trans>IPv4 Endpoints</Trans> :
                        <Trans>IPv6 Endpoints</Trans>
                }
            </h2>
            <div className="overflow-hidden border-2 rounded-lg px-2 w-full">
                <Table
                    aria-label={
                        version === IPVersion.V4 ?
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
                                    onChange={handleNewEndpointInput}
                                    onKeyDown={handleNewEndpointInputSubmit}
                                />
                            </TableCell>
                            <TableCell>
                                <AddButton
                                    onClick={() => onAdd(version, newEndpoint, endpoints)}
                                    disabled={newEndpoint.length === 0}
                                />
                            </TableCell>
                        </TableRow>
                        <>
                            {endpoints.map((endpoint, index) => (
                                <TableRow key={index}>
                                    <TableCell>{endpoint}</TableCell>
                                    <TableCell>
                                        <DeleteButton onClick={() => onDelete(version, endpoint)} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </>
                    </TableBody>
                </Table>
            </div>
            <div className="flex gap-4 justify-center items-center flex-wrap">
                <Button onClick={() => onReset(version)} className="cursor-pointer">
                    <Trans>Reset</Trans>
                </Button>
            </div>
        </div>
    );
}

export { IPEndpointsTable };
