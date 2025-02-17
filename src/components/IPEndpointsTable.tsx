import {
    Button,
    Input,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip,
} from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { mdiPlus, mdiTrashCan } from "@mdi/js";
import Icon from "@mdi/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

import {
    addIPEndpointAtom,
    deleteIPEndpointAtom,
    ipv4EndpointsAtom,
    ipv6EndpointsAtom,
    resetIPEndpointsAtom,
    Version,
} from "@/store/ip";
import logging from "@/utils/log";

interface IPEndpointsTableProps {
    version: Version;
}

export default function IPEndpointsTable(props: IPEndpointsTableProps) {
    const endpoints = useAtomValue(
        props.version === Version.V4 ? ipv4EndpointsAtom : ipv6EndpointsAtom
    );

    const resetEndpoints = useSetAtom(resetIPEndpointsAtom);
    const addEndpoint = useSetAtom(addIPEndpointAtom);
    const deleteEndpoints = useSetAtom(deleteIPEndpointAtom);

    const [newEndpoint, setNewEndpoint] = useState<string>("");

    const { t } = useLingui();

    const onReset = useCallback((version: Version) => {
        logging.info(`Resetting ${version} endpoints`);
        resetEndpoints(version);
        logging.info(`Reset ${version} endpoints done`);
    }, []);
    const onAdd = useCallback(
        (version: Version, endpoint: string, endpoints: string[]) => {
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

            logging.info(`Adding ${value} to ${version} endpoints`);
            addEndpoint(version, value);
            logging.info(`Add ${value} to ${version} endpoints done`);
            setNewEndpoint("");
        },
        []
    );
    const onDelete = useCallback((version: Version, endpoint: string) => {
        logging.info(`Deleting ${version} endpoint ${endpoint}`);
        deleteEndpoints(version, endpoint);
        logging.info(`Delete ${version} endpoint ${endpoint} done`);
    }, []);

    return (
        <div className="flex flex-col px-8 py-4 gap-4 items-center select-none">
            <h2 className="text-lg font-bold text-foreground transition-colors-opacity sm:text-2xl">
                {props.version === Version.V4 ? (
                    <Trans>IPv4 Endpoints</Trans>
                ) : (
                    <Trans>IPv6 Endpoints</Trans>
                )}
            </h2>
            <Table
                isKeyboardNavigationDisabled
                aria-label={
                    props.version === Version.V4
                        ? t`IPv4 Endpoints`
                        : t`IPv6 Endpoints`
                }
                className="text-wrap"
                classNames={{
                    wrapper: "transition-colors-opacity",
                    th: "transition-colors-opacity text-xs sm:text-sm",
                    td: "transition-colors-opacity text-xs sm:text-sm",
                }}
            >
                <TableHeader>
                    <TableColumn align="center">
                        <Trans>URL</Trans>
                    </TableColumn>
                    <TableColumn align="center">
                        <Trans>Actions</Trans>
                    </TableColumn>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <Input
                                placeholder={t`Enter endpoint URL here`}
                                aria-label="Endpoint URL"
                                variant="faded"
                                value={newEndpoint}
                                onChange={(e) => setNewEndpoint(e.target.value)}
                                classNames={{
                                    base: "min-w-[80px]",
                                    inputWrapper:
                                        "transition-colors-opacity !duration-250",
                                    input: "text-foreground transition-colors-opacity",
                                }}
                            />
                        </TableCell>
                        <TableCell>
                            <Tooltip
                                delay={500}
                                closeDelay={150}
                                content={t`Add endpoint`}
                                size="sm"
                                color="primary"
                            >
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    color="primary"
                                    isDisabled={newEndpoint.length === 0}
                                    className="text-default-400 transition-colors-opacity hover:text-primary-400"
                                    onPress={() =>
                                        onAdd(
                                            props.version,
                                            newEndpoint,
                                            endpoints
                                        )
                                    }
                                >
                                    <Icon path={mdiPlus} size={0.75} />
                                </Button>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                    <>
                        {endpoints.map((endpoint, index) => (
                            <TableRow key={index}>
                                <TableCell>{endpoint}</TableCell>
                                <TableCell>
                                    <Tooltip
                                        delay={500}
                                        closeDelay={150}
                                        content={t`Delete`}
                                        size="sm"
                                        color="danger"
                                    >
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            color="danger"
                                            className="text-default-400 transition-colors-opacity hover:text-danger-400"
                                            onPress={() =>
                                                onDelete(
                                                    props.version,
                                                    endpoint
                                                )
                                            }
                                        >
                                            <Icon
                                                path={mdiTrashCan}
                                                size={0.75}
                                            />
                                        </Button>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </>
                </TableBody>
            </Table>
            <div className="flex gap-4 justify-center items-center flex-wrap">
                <Button
                    onPress={() => onReset(props.version)}
                    className="bg-default hover:bg-default-100"
                >
                    <Trans>Reset</Trans>
                </Button>
            </div>
        </div>
    );
}
