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
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
} from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { selectAtom } from "jotai/utils";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import ProxySwitch from "@/components/ProxySwitch";
import { db } from "@/db";
import { useVultrAPI } from "@/hooks/vultr";
import { VultrAPI } from "@/lib/vultr";
import {
    firewallAtom,
    groupsAtom,
    groupTableRefreshingAtom,
    initialNewRuleIPv4,
    initialNewRuleIPv6,
    shouldUpdateFromDBAtom,
} from "@/store/firewall";
import { Version as IPVersion } from "@/store/ip";
import logging from "@/utils/log";

import Group from "./Group";

function DeleteModal({
    groupId,
    isOpen,
    onClose,
    onConfirm,
}: {
    groupId: string | null;
    isOpen: boolean;
    onClose?: () => void;
    onConfirm?: () => void;
}) {
    if (!groupId) return null;
    const groupState = useAtomValue(
        selectAtom(
            groupsAtom,
            useCallback((state) => state[groupId], [groupId])
        )
    );
    if (!groupState) return null;
    const group = groupState.group;
    return (
        <Modal
            backdrop="transparent"
            isOpen={isOpen}
            onClose={onClose}
            classNames={{
                base: "select-none",
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 text-danger-400">
                    <Trans>Delete Firewall Group</Trans>
                </ModalHeader>
                <ModalBody>
                    <p>
                        <Trans>
                            Are you sure you want to delete this firewall group?
                        </Trans>
                    </p>
                    <div className="text-warning">
                        <p>
                            <span>
                                <Trans>ID: </Trans>
                            </span>
                            <span className="font-mono">{group.id}</span>
                        </p>
                        <p>
                            <span>
                                <Trans>Description: </Trans>
                            </span>
                            <span className="font-mono uppercase">
                                {group.description}
                            </span>
                        </p>
                        <p>
                            <span>
                                <Trans>Date Created: </Trans>
                            </span>
                            <span className="font-mono">
                                {new Date(group.date_created).toLocaleString()}
                            </span>
                        </p>
                        <p>
                            <span>
                                <Trans>Rules: </Trans>
                            </span>
                            <span className="font-mono">
                                {group.rule_count}
                            </span>
                        </p>
                        <p>
                            <span>
                                <Trans>Instances: </Trans>
                            </span>
                            <span className="font-mono">
                                {group.instance_count}
                            </span>
                        </p>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onPress={onConfirm}>
                        <Trans>Confirm</Trans>
                    </Button>
                    <Button color="danger" variant="light" onPress={onClose}>
                        <Trans>Cancel</Trans>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default function GroupTable() {
    const refreshing = useAtomValue(groupTableRefreshingAtom);
    const shouldUpdateFromDB = useAtomValue(shouldUpdateFromDBAtom);

    const [groups, setGroups] = useAtom(groupsAtom);

    const [page, setPage] = useState(1);
    const rowsPerPage = 5;
    const pages = Math.ceil(Object.keys(groups).length / rowsPerPage) || 1;

    const setFirewall = useSetAtom(firewallAtom);

    const vultrAPI = useVultrAPI();

    const { t } = useLingui();

    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    const deleteModal = useDisclosure();

    const handleModalClose = useCallback(() => {
        deleteModal.onClose();
    }, []);
    const handleModalConfirm = useCallback(async () => {
        await handleDeleteGroup(vultrAPI, selectedGroupId);
        handleModalClose();
    }, [selectedGroupId]);
    const handleRefreshGroups = useCallback(async (vultrAPI: VultrAPI) => {
        try {
            logging.info(`Fetching firewall groups...`);
            setFirewall((state) => {
                state.refreshing = true;
            });

            logging.info(`Clearing local database...`);
            await db.groups.clear();
            setGroups({});
            await db.rules.clear();
            const { firewall_groups } = await vultrAPI.firewall.listGroups();
            logging.info(
                `Successfully fetched ${firewall_groups.length} firewall groups.`
            );
            setGroups((state) => {
                firewall_groups.forEach((group) => {
                    state[group.id] = {
                        group,
                        deleting: false,
                        shouldUpdateFromDB: false,
                        isRulesOutdated: true,
                        refreshing: false,
                        newRule: {
                            [IPVersion.V4]: initialNewRuleIPv4,
                            [IPVersion.V6]: initialNewRuleIPv6,
                        },
                    };
                });
            });
            await db.groups.bulkPut(firewall_groups);
            logging.info(`Successfully added firewall groups to DB.`);
        } catch (err) {
            if (err instanceof DOMException) {
                if (err.name === "TimeoutError") {
                    logging.warn(
                        `Failed to fetch firewall groups: request timed out`
                    );
                    toast.error(
                        t`Failed to fetch firewall groups: request timed out`
                    );
                } else if (err.name === "AbortError") {
                    logging.warn(
                        "Failed to fetch firewall groups: request aborted."
                    );
                } else {
                    logging.error(`Failed to fetch firewall groups: ${err}`);
                    toast.error(
                        t`Failed to fetch firewall groups: unknown error`
                    );
                }
            } else if (err instanceof TypeError) {
                logging.error(`Failed to fetch firewall groups: ${err}`);
                toast.error(t`Failed to fetch firewall groups: network error`);
            } else if (err instanceof Error) {
                logging.error(`Failed to fetch firewall groups: ${err}`);
                const message = err.message || err;
                toast.error(
                    <>
                        <p>
                            <Trans>Failed to fetch firewall groups</Trans>
                        </p>
                        <p>{message.toString()}</p>
                    </>
                );
            } else {
                logging.error(`Failed to fetch firewall groups: ${err}`);
                toast.error(t`Failed to fetch firewall groups: unknown error`);
            }
            setGroups({});
        } finally {
            setFirewall((state) => {
                state.refreshing = false;
            });
        }
    }, []);
    const handleDeleteGroup = useCallback(
        async (vultrAPI: VultrAPI, groupId: string | null) => {
            if (!groupId) {
                logging.warn(`Delete group operation failed: Group ID is null`);
                toast.error(`Delete group operation failed: Group ID is null`);
                return;
            }

            logging.info(`Deleting group with ID ${groupId}.`);
            setGroups((state) => {
                state[groupId].deleting = true;
            });
            try {
                await vultrAPI.firewall.deleteGroup({
                    "firewall-group-id": groupId,
                });
                logging.info(
                    `Successfully deleted group with ID ${groupId} from Vultr API.`
                );
                await db.groups.delete(groupId);
                logging.info(
                    `Successfully deleted group with ID ${groupId} from local database.`
                );
                setGroups((state) => {
                    delete state[groupId];
                });
                logging.info(`Successfully deleted group with ID ${groupId}`);
                toast.success(t`Successfully deleted group with ID ${groupId}`);
            } catch (err) {
                logging.error(`Failed to delete group: ${err}`);
                const message =
                    err instanceof Error ? err.message : "unknown error";
                toast.error(t`Failed to delete group: ${message}`);
                setGroups((state) => {
                    state[groupId].deleting = false;
                });
            }
        },
        []
    );

    const onGroupDelete = useCallback((id: string) => {
        setSelectedGroupId(id);
        deleteModal.onOpen();
    }, []);

    useEffect(() => {
        if (shouldUpdateFromDB) {
            const restoreFromDB = async () => {
                try {
                    logging.info(`Restoring firewall groups from DB...`);
                    setFirewall((state) => {
                        state.refreshing = true;
                    });
                    setGroups({});
                    const groups = await db.groups.toArray();
                    setGroups((state) => {
                        groups.forEach((group) => {
                            state[group.id] = {
                                group,
                                deleting: false,
                                shouldUpdateFromDB: true,
                                isRulesOutdated: false,
                                refreshing: false,
                                newRule: {
                                    [IPVersion.V4]: initialNewRuleIPv4,
                                    [IPVersion.V6]: initialNewRuleIPv6,
                                },
                            };
                        });
                    });
                    setFirewall((state) => {
                        state.shouldUpdateFromDB = false;
                        state.refreshing = false;
                    });
                } catch (err) {
                    logging.error(
                        `Error restoring firewall groups from DB: ${err}`
                    );
                    setFirewall((state) => {
                        state.refreshing = false;
                    });
                }
            };
            restoreFromDB();
        }
    }, [shouldUpdateFromDB]);

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
                        t`Last Modified`,
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
                    {Object.values(groups).map((groupState, index) => (
                        <TableRow
                            className={
                                refreshing || groupState.deleting
                                    ? "animate-pulse"
                                    : ""
                            }
                            key={index}
                        >
                            <TableCell>
                                <Group.IdCell value={groupState.group.id} />
                            </TableCell>
                            <TableCell>
                                <Group.DescriptionCell
                                    value={groupState.group.description}
                                />
                            </TableCell>
                            <TableCell>
                                <Group.DateCreatedCell
                                    value={groupState.group.date_created}
                                />
                            </TableCell>
                            <TableCell>
                                <Group.LastModifiedDateCell
                                    value={groupState.group.date_modified}
                                />
                            </TableCell>
                            <TableCell>
                                <Group.RuleCountCell
                                    value={groupState.group.rule_count}
                                />
                            </TableCell>
                            <TableCell>
                                <Group.InstanceCountCell
                                    value={groupState.group.instance_count}
                                />
                            </TableCell>
                            <TableCell>
                                <Group.ActionCell
                                    isDisabled={
                                        refreshing || groupState.deleting
                                    }
                                    id={groupState.group.id}
                                    onDelete={() =>
                                        onGroupDelete(groupState.group.id)
                                    }
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <DeleteModal
                groupId={selectedGroupId}
                isOpen={deleteModal.isOpen}
                onClose={handleModalClose}
                onConfirm={handleModalConfirm}
            />
            <div className="flex gap-4 justify-center items-center flex-wrap">
                <Button
                    onPress={() => handleRefreshGroups(vultrAPI)}
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
