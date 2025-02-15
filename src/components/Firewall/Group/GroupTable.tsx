import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Pagination,
    Table,
    TableBody,
    TableColumn,
    TableHeader,
    useDisclosure,
} from "@heroui/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import ProxySwitch from "@/components/ProxySwitch";
import useFetch from "@/hooks/fetch";
import { refreshingAtom } from "@/store/firewall/firewall";
import {
    deleteGroupByIdAtom,
    groupsAtom,
    refreshGroupsAtom,
} from "@/store/firewall/groups";
import { Settings, settingsAtom } from "@/store/settings";
import logging from "@/utils/log";

import Group from "./Group";

export default function GroupTable() {
    const settings = useAtomValue(settingsAtom);
    const groups = useAtomValue(groupsAtom);
    const refreshing = useAtomValue(refreshingAtom);

    const [page, setPage] = useState(1);
    const rowsPerPage = 5;
    const pages = Math.ceil(Object.keys(groups).length / rowsPerPage) || 1;

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
    const deleteTimeoutId = useRef<NodeJS.Timeout | null>(null);

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
                Firewall Groups
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
                isKeyboardNavigationDisabled
                topContent={
                    <div className="sticky left-1/2 -translate-x-1/2 w-fit">
                        <Pagination
                            isDisabled={refreshing}
                            showControls
                            color="primary"
                            variant="flat"
                            page={page}
                            total={pages}
                            onChange={(page) => setPage(page)}
                            classNames={{
                                item: "text-foreground !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,transform,background] !ease-[ease] !duration-250 bg-content3 [&[data-hover=true]:not([data-active=true])]:bg-content4",
                                prev: "text-foreground transition-colors-opacity bg-content3 [&[data-hover=true]:not([data-active=true])]:bg-content4 data-[disabled=true]:text-default-400",
                                next: "text-foreground transition-colors-opacity bg-content3 [&[data-hover=true]:not([data-active=true])]:bg-content4 data-[disabled=true]:text-default-400",
                            }}
                        />
                    </div>
                }
            >
                <TableHeader>
                    {[
                        "ID",
                        "Description",
                        "Date Created",
                        "Rules",
                        "Instances",
                        "Action",
                    ].map((head, index) => (
                        <TableColumn key={index} align="center">
                            {head}
                        </TableColumn>
                    ))}
                </TableHeader>
                <TableBody emptyContent="Empty">
                    {Object.values(groups).map((group, index) =>
                        Group({
                            key: index,
                            group,
                            onGroupDelete: (id: string) => {
                                selectedGroupId.current = id;
                                if (deleteTimeoutId.current)
                                    clearTimeout(deleteTimeoutId.current);
                                deleteModal.onOpen();
                            },
                            refreshing,
                        })
                    )}
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
                    className="bg-default hover:bg-default-100"
                >
                    Refresh
                </Button>
                <ProxySwitch />
            </div>
        </div>
    );
}
