import {
    Button,
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
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import ProxySwitch from "@/components/ProxySwitch";
import { useVultrAPI } from "@/hooks/vultr";
import { IFirewallGroup } from "@/lib/vultr/types";
import { groupsStateAtom, initialNewRuleIPv4 } from "@/store/firewall";
import { Version as IPVersion } from "@/store/ip";
import logging from "@/utils/log";

import DeleteGroupModal from "./DeleteGroupModal";
import Group from "./Group";

export default function GroupTable() {
    const vultrAPI = useVultrAPI();

    const { t } = useLingui();

    const [groupsState, setGroupsState] = useAtom(groupsStateAtom);

    const groupsQuery = useQuery({
        queryKey: ["groups"],
        staleTime: 1000 * 30, // 30 seconds
        queryFn: vultrAPI.firewall.listGroups,
        select: (data) => data.firewall_groups,
        retry: false,
    });

    const isLoading = groupsQuery.isFetching;

    const [page, setPage] = useState(1);
    const rowsPerPage = 5;
    const pages = Math.ceil(Object.keys(groupsState).length / rowsPerPage) || 1;

    const [selectedGroup, setSelectedGroup] = useState<IFirewallGroup | null>(
        null
    );

    const deleteModal = useDisclosure();

    const handleModalClose = useCallback(() => {
        deleteModal.onClose();
    }, []);
    const handleRefreshGroups = useCallback(async () => {
        await groupsQuery.refetch();
    }, []);

    const onGroupDelete = useCallback((group: IFirewallGroup) => {
        setSelectedGroup(group);
        deleteModal.onOpen();
    }, []);

    useEffect(() => {
        if (groupsQuery.isError) {
            logging.error(
                `Failed to fetch firewall groups: ${groupsQuery.error}`
            );
            const message =
                groupsQuery.error instanceof Error
                    ? groupsQuery.error.message
                    : groupsQuery.error;
            toast.error(t`Failed to fetch firewall groups: ${message}`);
        }
    }, [groupsQuery.isError]);

    useEffect(() => {
        const data = groupsQuery.data || [];
        setGroupsState((state) => {
            // add new groups or update existing ones
            data.forEach((group) => {
                if (!state[group.id]) {
                    state[group.id] = {
                        group: group,
                        newRule: {
                            [IPVersion.V4]: initialNewRuleIPv4,
                            [IPVersion.V6]: initialNewRuleIPv4,
                        },
                        newDescription: group.description,
                        isUpdating: false,
                        isDeleting: false,
                    };
                } else {
                    state[group.id].group = group;
                }
            });
            // remove groups that are no longer in the data
            Object.keys(state).forEach((key) => {
                if (!data.find((group) => group.id === key)) {
                    delete state[key];
                }
            });
        });
    }, [groupsQuery.data]);

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
                        "overflow-x-auto" + (isLoading ? "animate-pulse" : ""),
                }}
                isKeyboardNavigationDisabled
                topContent={
                    <div className="sticky left-1/2 -translate-x-1/2 w-fit">
                        <Pagination
                            isDisabled={isLoading}
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
                    {Object.values(groupsState).map((state, index) => {
                        const group = state.group!;
                        return (
                            <TableRow
                                className={isLoading ? "animate-pulse" : ""}
                                key={index}
                            >
                                <TableCell>
                                    <Group.IdCell value={group.id} />
                                </TableCell>
                                <TableCell>
                                    <Group.DescriptionCell
                                        isDisabled={isLoading}
                                        groupId={group.id}
                                        description={group.description}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Group.DateCreatedCell
                                        value={group.date_created}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Group.LastModifiedDateCell
                                        value={group.date_modified}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Group.RuleCountCell
                                        value={group.rule_count}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Group.InstanceCountCell
                                        value={group.instance_count}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Group.ActionCell
                                        isDisabled={isLoading}
                                        groupId={group.id}
                                        description={group.description}
                                        onDelete={() => onGroupDelete(group)}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            <DeleteGroupModal
                group={selectedGroup}
                isOpen={deleteModal.isOpen}
                onClose={handleModalClose}
            />
            <div className="flex gap-4 justify-center items-center flex-wrap">
                <Button
                    onPress={handleRefreshGroups}
                    isLoading={groupsQuery.isFetching}
                    className="bg-default hover:bg-default-100"
                >
                    <Trans>Refresh</Trans>
                </Button>
                <ProxySwitch />
            </div>
        </div>
    );
}
