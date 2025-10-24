import { VultrFirewall } from "@lavascope/store/firewlall";
import { ProxySwitch } from "@lavascope/ui/components/lavascope/proxy-switch";
import { Button, Spinner } from "@lavascope/ui/components/ui";
import { Trans, useLingui } from "@lingui/react/macro";
import { useAtomValue } from "jotai";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { useGroupsQuery } from "@/hooks/Firewall";
import type { IFirewallGroup } from "@/lib/vultr/types";

import Group from "../Group";
import { CreateGroupModal } from "../Modal";
import DeleteGroupModal from "../Modal/DeleteGroupModal";
import CreateGroupButton from "./CreateGroupButton";
import TablePagination from "./Pagination";

function GroupTable() {
    const { t } = useLingui();

    const groupsState = useAtomValue(VultrFirewall.groupsStateAtom);

    const { refetch } = useGroupsQuery();

    const deleteModal = useDisclosure();
    const createModal = useDisclosure();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [selectedGroup, setSelectedGroup] = useState<IFirewallGroup | null>(null);

    const handleRefreshGroups = useCallback(async () => {
        setIsLoading(true);
        const res = await refetch();
        if (res.isError) {
            const message = res.error instanceof Error ?
                res.error.message :
                res.error;
            toast.error(() => <Trans>Failed to refresh firewall groups</Trans>, { description: message });
        }
        setIsLoading(false);
    }, []);

    const onGroupDelete = useCallback((group: IFirewallGroup) => {
        setSelectedGroup(group);
        deleteModal.onOpen();
    }, []);

    const rowsPerPage = 5;
    const pages = Math.ceil(Object.keys(groupsState).length / rowsPerPage) || 1;
    const pagedGroupsState = Object.values(groupsState).filter((groupState) => groupState !== undefined).slice((page - 1) * rowsPerPage, page * rowsPerPage);
    if (page > pages) setPage(pages);

    const tableHeaders = [
        t`ID`,
        t`Description`,
        t`Date Created`,
        t`Last Modified`,
        t`Rules`,
        t`Instances`,
        t`Action`,
    ];

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
                topContent={(
                    <div className="sticky flex left-0 w-full">
                        <TablePagination total={pages} page={page} setPage={setPage} isLoading={isLoading} />
                        <CreateGroupButton onPress={createModal.onOpen} />
                    </div>
                )}
            >
                <TableHeader>
                    {tableHeaders.map((head, index) => (
                        <TableColumn key={index} align="center">
                            {head}
                        </TableColumn>
                    ))}
                </TableHeader>
                <TableBody emptyContent="Empty">
                    {pagedGroupsState
                        .map((groupState, index) => {
                            const group = groupState.group;
                            return (
                                <TableRow
                                    className={isLoading || groupState.isCreating || groupState.isDeleting ? "animate-pulse" : ""}
                                    key={index}
                                >
                                    <TableCell>
                                        <Group.IdCell groupId={groupState.isCreating ? "-" : group.id} />
                                    </TableCell>
                                    <TableCell>
                                        <Group.DescriptionCell
                                            isDisabled={isLoading || groupState.isCreating || groupState.isUpdating || groupState.isDeleting}
                                            groupId={group.id}
                                            description={group.description}
                                            newDescription={groupState.newDescription}
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
                                            isDisabled={isLoading || groupState.isCreating || groupState.isUpdating || groupState.isDeleting}
                                            isUpdating={groupState.isUpdating}
                                            isDeleting={groupState.isDeleting}
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
                onClose={deleteModal.onClose}
            />
            <CreateGroupModal isOpen={createModal.isOpen} onClose={createModal.onClose} />
            <div className="flex gap-4 justify-center items-center flex-wrap">
                <Button
                    onClick={handleRefreshGroups}
                    disabled={isLoading}
                    className="bg-default hover:bg-default-100"
                >
                    {
                        isLoading && <Spinner />
                    }
                    <Trans>Refresh</Trans>
                </Button>
                <ProxySwitch />
            </div>
        </div>
    );
}

export { GroupTable };
