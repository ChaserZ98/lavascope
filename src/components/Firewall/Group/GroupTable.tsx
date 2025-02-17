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
import { Trans, useLingui } from "@lingui/react/macro";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import ProxySwitch from "@/components/ProxySwitch";
import useFetch from "@/hooks/fetch";
import { firewallAtom, refreshingAtom } from "@/store/firewall/firewall";
import {
    deleteGroupAPI,
    GroupInfo,
    groupsAtom,
    GroupState,
    initialGroupState,
    refreshGroupsAPI,
} from "@/store/firewall/groups";
import { apiTokenAtom, proxyAddressAtom, useProxyAtom } from "@/store/settings";
import logging from "@/utils/log";

import Group from "./Group";

export default function GroupTable() {
    const apiToken = useAtomValue(apiTokenAtom);
    const useProxy = useAtomValue(useProxyAtom);
    const proxyAddress = useAtomValue(proxyAddressAtom);
    const groups = useAtomValue(groupsAtom);
    const refreshing = useAtomValue(refreshingAtom);

    const [page, setPage] = useState(1);
    const rowsPerPage = 5;
    const pages = Math.ceil(Object.keys(groups).length / rowsPerPage) || 1;

    const setFirewall = useSetAtom(firewallAtom);

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

    const { t } = useLingui();

    const selectedGroupId = useRef<string | null>(null);
    const deleteTimeoutId = useRef<NodeJS.Timeout | null>(null);

    const deleteModal = useDisclosure();

    const fetchGroups = useCallback(
        (
            apiToken: string,
            fetchClient: typeof fetch,
            timeout: number = 5000
        ) => {
            logging.info(`Fetching firewall groups.`);
            setFirewall((state) => {
                state.refreshing = true;
            });
            const timeoutSignal = AbortSignal.timeout(timeout);
            refreshGroupsAPI(apiToken, fetchClient, timeoutSignal)
                .then(async (res) => {
                    return {
                        status: res.status,
                        statusText: res.statusText,
                        data: await res.json(),
                    };
                })
                .then((res) => {
                    if (res.status < 400) {
                        const firewall_groups: GroupInfo[] =
                            res.data.firewall_groups;
                        logging.info(
                            `Successfully fetched ${res.data.meta.total} firewall groups.`
                        );
                        setFirewall((state) => {
                            state.meta = res.data.meta;
                            state.groups = firewall_groups.reduce(
                                (acc, group) => {
                                    acc[group.id] =
                                        group.id in state.groups &&
                                        state.groups[group.id].date_modified ===
                                            group.date_modified
                                            ? state.groups[group.id]
                                            : {
                                                  ...initialGroupState,
                                                  ...group,
                                              };
                                    return acc;
                                },
                                {} as Record<string, GroupState>
                            );
                        });
                    } else if (res.status < 500)
                        throw new Error(
                            `${res.data.error ? res.data.error : res.statusText}`
                        );
                    else throw new Error(`${res.status} ${res.statusText}`);
                })
                .catch((err: Error) => {
                    if (timeoutSignal.aborted) {
                        logging.warn(
                            `Failed to fetch firewall groups: ${timeoutSignal.reason}`
                        );
                    } else {
                        logging.error(
                            `Failed to fetch firewall groups: ${err}`
                        );
                    }
                    const reason = timeoutSignal.aborted
                        ? timeoutSignal.reason.message
                        : err.message || err;
                    toast.error(t`Failed to fetch firewall groups: ${reason}`);
                    setFirewall((state) => {
                        state.groups = {};
                        state.meta = null;
                    });
                })
                .finally(() => {
                    setFirewall((state) => {
                        state.refreshing = false;
                    });
                });
        },
        []
    );
    const deleteGroup = useCallback(
        (
            id: string,
            apiToken: string,
            fetchClient: typeof fetch,
            timeout: number = 5000
        ) => {
            logging.info(`Deleting group with ID ${id}.`);
            setFirewall((state) => {
                state.groups[id].deleting = true;
            });
            const timeoutSignal = AbortSignal.timeout(timeout);
            deleteGroupAPI(id, apiToken, fetchClient, timeoutSignal)
                .then(async (res) => {
                    if (!res.ok) {
                        const data = await res.json();
                        throw new Error(
                            `${res.status} ${data.error ? data.error : res.statusText}`
                        );
                    }

                    setFirewall((state) => {
                        delete state.groups[id];
                    });
                    logging.info(`Successfully deleted group with ID ${id}`);
                    toast.success(t`Successfully deleted group with ID ${id}`);
                })
                .catch((err: Error) => {
                    if (timeoutSignal.aborted) {
                        logging.error(
                            `Failed to delete group: ${timeoutSignal.reason}`
                        );
                        toast.error(
                            `Failed to delete group: ${timeoutSignal.reason.message}`
                        );
                    } else {
                        logging.error(`Failed to delete group: ${err}`);
                        const message = err.message;
                        toast.error(t`Failed to delete group: ${message}`);
                    }
                    setFirewall((state) => {
                        state.groups[id].deleting = false;
                    });
                });
        },
        []
    );

    useEffect(() => {
        if (groups === undefined && apiToken)
            fetchGroups(apiToken, fetchClient);
    }, [groups, fetchClient, apiToken]);

    return (
        <div className="flex flex-col w-full max-w-fit gap-4 select-none md:px-8">
            <h2 className="text-lg text-center font-bold text-foreground transition-colors-opacity sm:text-2xl">
                <Trans>Firewall Groups</Trans>
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
                        t`ID`,
                        t`Description`,
                        t`Date Created`,
                        t`Rules`,
                        t`Instances`,
                        t`Action`,
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
                                <Trans>Delete Firewall Group</Trans>
                            </ModalHeader>
                            <ModalBody>
                                <p>
                                    <Trans>
                                        Are you sure you want to delete this
                                        firewall group?
                                    </Trans>
                                </p>
                                <div className="text-warning">
                                    <p>
                                        <span>
                                            <Trans>ID: </Trans>
                                        </span>
                                        <span className="font-mono">
                                            {selectedGroupId.current}
                                        </span>
                                    </p>
                                    <p>
                                        <span>
                                            <Trans>Description: </Trans>
                                        </span>
                                        <span className="font-mono uppercase">
                                            {selectedGroupId.current &&
                                                groups[selectedGroupId.current]
                                                    ?.description}
                                        </span>
                                    </p>
                                    <p>
                                        <span>
                                            <Trans>Date Created: </Trans>
                                        </span>
                                        <span className="font-mono">
                                            {selectedGroupId.current &&
                                                new Date(
                                                    groups[
                                                        selectedGroupId.current
                                                    ]?.date_created
                                                ).toLocaleString()}
                                        </span>
                                    </p>
                                    <p>
                                        <span>
                                            <Trans>Rules: </Trans>
                                        </span>
                                        <span className="font-mono">
                                            {selectedGroupId.current &&
                                                groups[selectedGroupId.current]
                                                    ?.rule_count}
                                        </span>
                                    </p>
                                    <p>
                                        <span>
                                            <Trans>Instances: </Trans>
                                        </span>
                                        <span className="font-mono">
                                            {selectedGroupId.current &&
                                                groups[selectedGroupId.current]
                                                    ?.instance_count}
                                        </span>
                                    </p>
                                </div>
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
                                        deleteGroup(
                                            selectedGroupId.current,
                                            apiToken,
                                            fetchClient
                                        );
                                        onClose();
                                    }}
                                >
                                    <Trans>Confirm</Trans>
                                </Button>
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                >
                                    <Trans>Cancel</Trans>
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <div className="flex gap-4 justify-center items-center flex-wrap">
                <Button
                    onPress={() => fetchGroups(apiToken, fetchClient)}
                    isLoading={refreshing}
                    className="bg-default hover:bg-default-100"
                >
                    <Trans>Refresh</Trans>
                </Button>
                <ProxySwitch />
            </div>
        </div>
    );
}
