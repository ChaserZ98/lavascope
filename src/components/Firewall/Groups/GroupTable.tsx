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
import { useAtomValue } from "jotai";
import { useCallback, useState } from "react";

import ProxySwitch from "@/components/ProxySwitch";
import { useGroupsQuery } from "@/hooks/Firewall";
import { IFirewallGroup } from "@/lib/vultr/types";
import { groupsStateAtom } from "@/store/firewall";

import DeleteGroupModal from "./DeleteGroupModal";
import Group from "./Group";

export default function GroupTable() {
    const { t } = useLingui();

    const groupsState = useAtomValue(groupsStateAtom);

    const groupsQuery = useGroupsQuery();

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
                    {Object.values(groupsState)
                        .map((state) => state?.group)
                        .filter((state) => state !== undefined)
                        .map((group, index) => (
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
                        ))}
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
