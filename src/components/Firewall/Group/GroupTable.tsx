import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip,
    useDisclosure,
} from "@heroui/react";
import { mdiPencil, mdiTrashCan } from "@mdi/js";
import Icon from "@mdi/react";
import { Link } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";

import ProxySwitch from "@/components/ProxySwitch";
import useFetch from "@/hooks/fetch";
import { Environment, environmentAtom } from "@/store/environment";
import { refreshingAtom } from "@/store/firewall/firewall";
import {
    deleteGroupByIdAtom,
    groupsAtom,
    refreshGroupsAtom,
} from "@/store/firewall/groups";
import { Settings, settingsAtom } from "@/store/settings";
import logging from "@/utils/log";

export default function GroupTable() {
    const environment = useAtomValue(environmentAtom);
    const settings = useAtomValue(settingsAtom);
    const groups = useAtomValue(groupsAtom);
    const refreshing = useAtomValue(refreshingAtom);
    const refreshGroups = useSetAtom(refreshGroupsAtom);
    const deleteGroupById = useSetAtom(deleteGroupByIdAtom);

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

    const selectedGroupId = useRef<string | null>(null);
    const deleteTimeoutId = useRef<number | null>(null);

    const deleteModal = useDisclosure();

    const fetchGroups = useCallback(
        (settings: Settings, fetchClient: typeof fetch) => {
            refreshGroups(settings.apiToken, fetchClient);
        },
        []
    );

    useEffect(() => {
        if (groups === undefined && settings.apiToken)
            fetchGroups(settings, fetchClient);
    }, [groups, fetchClient]);

    return (
        <div className="flex flex-col w-full max-w-fit gap-4 select-none md:px-8">
            <h2 className="text-lg text-center font-bold text-foreground transition-colors-opacity sm:text-2xl">
                Vultr Firewall Groups
            </h2>
            <Table
                aria-label="IP Table"
                classNames={{
                    wrapper: "transition-colors-opacity",
                    th: "transition-colors-opacity text-xs font-light sm:text-sm sm:font-bold",
                    td: "transition-colors-opacity text-xs sm:text-sm text-foreground font-mono",
                    base:
                        "overflow-x-auto" + (refreshing ? "animate-pulse" : ""),
                }}
            >
                <TableHeader>
                    <TableColumn align="center">ID</TableColumn>
                    <TableColumn align="center">Description</TableColumn>
                    <TableColumn align="center">Date Created</TableColumn>
                    <TableColumn align="center">Rules</TableColumn>
                    <TableColumn align="center">Instances</TableColumn>
                    <TableColumn align="center">Action</TableColumn>
                </TableHeader>
                <TableBody emptyContent="Empty">
                    {Object.values(groups).map((group, index) => (
                        <TableRow
                            key={index}
                            className={group.deleting ? "animate-pulse" : ""}
                        >
                            <TableCell>{group.id}</TableCell>
                            <TableCell>{group.description}</TableCell>
                            <TableCell>
                                {new Date(group.date_created).toLocaleString(
                                    Intl.DateTimeFormat().resolvedOptions()
                                        .locale,
                                    {
                                        timeZoneName: "short",
                                        hour12: false,
                                    }
                                )}
                            </TableCell>
                            <TableCell>{group.rule_count}</TableCell>
                            <TableCell>{group.instance_count}</TableCell>
                            <TableCell>
                                <div className="flex w-16 items-center justify-end">
                                    {!group.deleting && !refreshing && (
                                        <Tooltip
                                            content="Edit"
                                            delay={1000}
                                            closeDelay={100}
                                        >
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                color="primary"
                                                to={`/groups/${group.id}`}
                                                className="text-default-400 transition-colors-opacity hover:text-primary-400"
                                                as={Link}
                                            >
                                                <Icon
                                                    path={mdiPencil}
                                                    size={0.75}
                                                    className="cursor-pointer"
                                                />
                                            </Button>
                                        </Tooltip>
                                    )}
                                    <Tooltip
                                        content="Delete"
                                        delay={1000}
                                        closeDelay={100}
                                    >
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            color="danger"
                                            className="text-default-400 transition-colors-opacity hover:text-danger-400"
                                            onPress={() => {
                                                selectedGroupId.current =
                                                    group.id;
                                                if (deleteTimeoutId.current)
                                                    clearTimeout(
                                                        deleteTimeoutId.current
                                                    );
                                                deleteModal.onOpen();
                                            }}
                                            disabled={
                                                group.deleting || refreshing
                                            }
                                        >
                                            <Icon
                                                path={mdiTrashCan}
                                                size={0.75}
                                            />
                                        </Button>
                                    </Tooltip>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Modal
                backdrop="transparent"
                isOpen={deleteModal.isOpen}
                onClose={() => {
                    deleteTimeoutId.current = setTimeout(
                        () => (selectedGroupId.current = null),
                        1000
                    );
                    deleteModal.onClose();
                }}
                classNames={{
                    base: "select-none",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-danger-400">
                                Delete Firewall Group
                            </ModalHeader>
                            <ModalBody>
                                <p>
                                    Are you sure you want to delete the firewall
                                    group with id{" "}
                                    <span className="text-warning">
                                        {selectedGroupId.current}
                                    </span>
                                    ?
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="primary"
                                    onPress={() => {
                                        if (!selectedGroupId.current) {
                                            logging.warn(
                                                `Delete group operation failed: Group ID is null`
                                            );
                                            toast.error(
                                                `Delete group operation failed: Group ID is null`
                                            );
                                            return;
                                        }
                                        deleteGroupById(
                                            selectedGroupId.current,
                                            settings.apiToken,
                                            fetchClient
                                        );
                                        onClose();
                                    }}
                                >
                                    Confirm
                                </Button>
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                >
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <div className="flex gap-4 justify-center items-center flex-wrap">
                <Button
                    onPress={() => fetchGroups(settings, fetchClient)}
                    isLoading={refreshing}
                >
                    Refresh
                </Button>
                {environment !== Environment.WEB && <ProxySwitch />}
            </div>
        </div>
    );
}
