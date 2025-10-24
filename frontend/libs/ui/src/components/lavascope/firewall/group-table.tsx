import { useVultrAPI } from "@lavascope/hook";
import logging from "@lavascope/log";
import { IPVersion } from "@lavascope/store";
import { VultrFirewall } from "@lavascope/store/firewlall";
import type { IListGroupsResponse } from "@lavascope/vultr";
import { Trans, useLingui } from "@lingui/react/macro";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type PaginationState,
    type RowSelectionState,
    type SortingState,
    useReactTable,
    type VisibilityState
} from "@tanstack/react-table";
import { produce } from "immer";
import { useAtomValue, useSetAtom } from "jotai";
import { ArrowUpDown, ChevronDown, ChevronLeftIcon, ChevronRightIcon, PlusIcon, SquarePenIcon, TrashIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ProxySwitch } from "#components/lavascope";
import { Button, Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, Input, Label, Spinner, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tooltip, TooltipContent, TooltipTrigger } from "#components/ui";

const idColumn: ColumnDef<VultrFirewall.Group> = {
    id: "ID",
    accessorKey: "id",
    header: () => <div className="text-center">ID</div>,
    cell: ({ row, column }) => <div className="text-center">{row.getValue(column.id)}</div>,
};
const descriptionColumn: ColumnDef<VultrFirewall.Group> = {
    id: "Description",
    accessorKey: "description",
    header: () => (
        <div className="w-fit mx-auto">
            <Trans>Description</Trans>
        </div>
    ),
    cell: ({ row, column }) => <div className="lowercase text-center">{row.getValue(column.id)}</div>,
};
const dateCreatedColumn: ColumnDef<VultrFirewall.Group> = {
    id: "Date Created",
    accessorKey: "date_created",
    header: ({ column }) => (
        <div className="w-fit mx-auto">
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                <Trans>Date Created</Trans>
                <ArrowUpDown />
            </Button>
        </div>
    ),
    cell: ({ row, column }) => {
        const value = new Date(row.getValue(column.id)).toLocaleString(
            Intl.DateTimeFormat().resolvedOptions().locale,
            {
                timeZoneName: "short",
                hour12: false,
            }
        );

        return <div className="text-center">{value}</div>;
    },
};
const lastModifiedColumn: ColumnDef<VultrFirewall.Group> = {
    id: "Last Modified",
    accessorKey: "date_modified",
    header: ({ column }) => (
        <div className="w-fit mx-auto">
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                <Trans>Last Modified</Trans>
                <ArrowUpDown />
            </Button>
        </div>
    ),
    cell: ({ row, column }) => {
        const value = new Date(row.getValue(column.id)).toLocaleString(
            Intl.DateTimeFormat().resolvedOptions().locale,
            {
                timeZoneName: "short",
                hour12: false,
            }
        );
        return (
            <div className="text-center">{value}</div>
        );
    },
};
const rulesColumn: ColumnDef<VultrFirewall.Group> = {
    id: "Rules",
    accessorKey: "rule_count",
    header: () => <div className="text-center"><Trans>Rules</Trans></div>,
    cell: ({ row, column }) => <div className="text-center">{row.getValue(column.id)}</div>
};
const instancesColumn: ColumnDef<VultrFirewall.Group> = {
    id: "Instances",
    accessorKey: "instance_count",
    header: () => <div className="text-center"><Trans>Instances</Trans></div>,
    cell: ({ row, column }) => <div className="text-center">{row.getValue(column.id)}</div>
};
const actionsColumn: ColumnDef<VultrFirewall.Group> = {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-center"><Trans>Actions</Trans></div>,
    cell: ({ row }) => {
        const group = row.original;

        return (
            <div className="flex gap-2 justify-center items-center">
                <Tooltip delayDuration={1000}>
                    <TooltipTrigger asChild>
                        <Button size="icon-sm" className="bg-transparent text-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground" onClick={() => navigator.clipboard.writeText(group.id)}>
                            <SquarePenIcon />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="select-none" color="primary">
                        <Trans>Edit Rules</Trans>
                    </TooltipContent>
                </Tooltip>
                <DeleteGroupButton group={group} />
            </div>
        );

        // return (
        //     <DropdownMenu>
        //         <DropdownMenuTrigger asChild>
        //             <Button variant="ghost" className="h-8 w-8 p-0">
        //                 <span className="sr-only">Open menu</span>
        //                 <MoreHorizontal />
        //             </Button>
        //         </DropdownMenuTrigger>
        //         <DropdownMenuContent align="end">
        //             <DropdownMenuLabel className="text-foreground">Actions</DropdownMenuLabel>
        //             <DropdownMenuItem
        //                 onClick={() => navigator.clipboard.writeText(payment.id)}
        //             >
        //                 Copy payment ID
        //             </DropdownMenuItem>
        //             <DropdownMenuSeparator />
        //             <DropdownMenuItem>View customer</DropdownMenuItem>
        //             <DropdownMenuItem>View payment details</DropdownMenuItem>
        //         </DropdownMenuContent>
        //     </DropdownMenu>
        // );
    },
};

const columns: ColumnDef<VultrFirewall.Group>[] = [
    idColumn,
    descriptionColumn,
    dateCreatedColumn,
    lastModifiedColumn,
    rulesColumn,
    instancesColumn,
    actionsColumn,
];

function useGroupsQuery() {
    const vultrAPI = useVultrAPI();

    const groupsQuery = useQuery({
        queryKey: ["groups"],
        staleTime: 1000 * 30, // 30 seconds
        queryFn: vultrAPI.firewall.listGroups,
        select: (data) => data.firewall_groups,
        retry: false,
    });

    const setGroupsState = useSetAtom(VultrFirewall.groupsStateAtom);

    useEffect(() => {
        if (groupsQuery.isError) logging.error(`Failed to fetch firewall groups: ${groupsQuery.error}`);
    }, [groupsQuery.isError]);

    useEffect(() => {
        const data = groupsQuery.data;
        if (!data) return;
        setGroupsState(produce((state) => {
            data.forEach((group) => {
                const groupId = group.id;
                if (!state[groupId]) {
                    state[groupId] = {
                        group,
                        newRule: {
                            [IPVersion.V4]: VultrFirewall.initialNewRuleIPv4,
                            [IPVersion.V6]: VultrFirewall.initialNewRuleIPv6,
                        },
                        newDescription: group.description,
                        isUpdating: false,
                        isDeleting: false,
                        isCreating: false,
                    };
                } else {
                    state[groupId].group = group;
                }
            });
            // remove groups that are no longer in the data
            Object.keys(state).forEach((key) => {
                if (!data.find((group) => group.id === key)) {
                    // ignore groups that are being created, updated, or deleted since they will be handled by their respective mutations
                    if (state[key]?.isCreating || state[key]?.isUpdating || state[key]?.isDeleting) return;
                    delete state[key];
                }
            });
        }));
    }, [groupsQuery.data]);

    return groupsQuery;
}

function useCreateGroupMutation() {
    const vultrAPI = useVultrAPI();

    const queryClient = useQueryClient();

    const getCreatingGroupCount = useSetAtom(VultrFirewall.getCreatingGroupCountAtom);
    const addGroupState = useSetAtom(VultrFirewall.addGroupStateAtom);
    const deleteGroupState = useSetAtom(VultrFirewall.deleteGroupStateAtom);
    const persistCreatingGroup = useSetAtom(VultrFirewall.persistCreatingGroupAtom);

    const createGroupMutation = useMutation({
        mutationFn: async (description: string) => await vultrAPI.firewall.createGroup({ description }),
        onMutate: async (description) => {
            const count = getCreatingGroupCount();
            const creatingGroupId = `temp-${count}`;
            const creatingGroupState = {
                group: {
                    id: creatingGroupId,
                    description,
                    date_created: new Date().toISOString(),
                    date_modified: new Date().toISOString(),
                    instance_count: 0,
                    rule_count: 0,
                    max_rule_count: 0
                },
                newRule: {
                    [IPVersion.V4]: VultrFirewall.initialNewRuleIPv4,
                    [IPVersion.V6]: VultrFirewall.initialNewRuleIPv6,
                },
                newDescription: description,
                isUpdating: false,
                isDeleting: false,
                isCreating: true,
            };
            addGroupState(creatingGroupState);
            return {
                creatingGroupId,
                restore: () => {
                    deleteGroupState(creatingGroupId);
                }
            };
        },
        onSuccess: async (data, _, { creatingGroupId }) => {
            const group = data.firewall_group;
            const groupState: VultrFirewall.GroupState = {
                group,
                newRule: {
                    [IPVersion.V4]: VultrFirewall.initialNewRuleIPv4,
                    [IPVersion.V6]: VultrFirewall.initialNewRuleIPv6,
                },
                newDescription: group.description,
                isUpdating: false,
                isDeleting: false,
                isCreating: false,
            };
            persistCreatingGroup(creatingGroupId, groupState);
            queryClient.setQueryData(["groups"], (state: IListGroupsResponse) => produce(state, (draft) => {
                draft.meta.total += 1;
                draft.firewall_groups.push(group);
            }));
            logging.info(`Successfully created a new firewall group.`);
        },
        onError: (err, _, context) => {
            if (context !== undefined) context.restore();
            logging.error(`Failed to create the new firewall group: ${err}`);
            const message = err.message || "unknown error";
            toast.error(() => <Trans>Failed to create the new firewall group</Trans>, { description: message });
        },
        retry: false,
    });

    return createGroupMutation;
}

function CreateGroupButton() {
    const [description, setDescription] = useState<string>("");
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);

    const { t } = useLingui();

    const createGroupMutation = useCreateGroupMutation();

    const handleConfirm = useCallback(() => {
        if (isCreating) return;
        setIsCreating(true);
        setOpen(false);
        setIsCreating(false);
        createGroupMutation.mutate(description);
    }, [description, isCreating]);

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
                setDescription("");
            }}
        >
            <Tooltip delayDuration={1000}>
                <DialogTrigger>
                    <TooltipTrigger asChild>
                        <Button
                            className="ml-2 h-full bg-accent text-accent-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground"
                            onClick={() => setOpen(true)}
                        >
                            <PlusIcon />
                        </Button>
                    </TooltipTrigger>
                </DialogTrigger>
                <TooltipContent className="select-none">
                    <Trans>Create Group</Trans>
                </TooltipContent>
            </Tooltip>
            <DialogContent className="select-none">
                <DialogHeader>
                    <DialogTitle>
                        <Trans>New Firewall Group</Trans>
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <Label htmlFor="new-description">
                        <Trans>Description</Trans>
                    </Label>
                    <Input
                        id="new-description"
                        name="newDescription"
                        placeholder={t`Enter description here...`}
                        disabled={isCreating}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button
                        className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/80"
                        disabled={isCreating}
                        onClick={() => handleConfirm()}
                    >
                        {
                            isCreating && <Spinner />
                        }
                        <Trans>Confirm</Trans>
                    </Button>
                    <DialogClose asChild>
                        <Button className="cursor-pointer">
                            <Trans>Cancel</Trans>
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function useDeleteGroupMutation() {
    const vultrAPI = useVultrAPI();

    const queryClient = useQueryClient();

    const setGroupIsDeleting = useSetAtom(VultrFirewall.setGroupIsDeletingAtom);
    const deleteGroupState = useSetAtom(VultrFirewall.deleteGroupStateAtom);

    const deleteGroupMutation = useMutation({
        mutationKey: ["groups"],
        mutationFn: async (groupId: string) =>
            await vultrAPI.firewall.deleteGroup({
                "firewall-group-id": groupId,
            }),
        onMutate: async (groupId) => {
            setGroupIsDeleting(groupId, true);
        },
        onSuccess: async (_, groupId) => {
            deleteGroupState(groupId);
            queryClient.setQueryData(["groups"], (state: IListGroupsResponse) =>
                produce(state, (draft) => {
                    draft.meta.total -= 1;
                    draft.firewall_groups = draft.firewall_groups.filter((group) => group.id !== groupId);
                })
            );
            logging.info(`Successfully deleted group with ID ${groupId}`);
            toast.success(() => <Trans>Successfully deleted group with ID {groupId}</Trans>);
        },
        onError: (err) => {
            logging.error(`Failed to delete group: ${err}`);
            const message = err.message || "unknown error";
            toast.error(() => <Trans>Failed to delete group</Trans>, { description: message });
        },
        onSettled: (_res, _err, groupId: string) => {
            setGroupIsDeleting(groupId, false);
        },
    });

    return deleteGroupMutation;
}

function DeleteGroupButton({ group }: { group: VultrFirewall.Group }) {
    const [open, setOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const deleteGroupMutation = useDeleteGroupMutation();

    const handleConfirm = useCallback(() => {
        if (isDeleting) return;
        setIsDeleting(true);
        setOpen(false);
        setIsDeleting(false);
        deleteGroupMutation.mutate(group.id);
    }, [isDeleting, group.id]);

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => setOpen(v)}
        >
            <Tooltip delayDuration={1000}>
                <DialogTrigger>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon-sm"
                            className="bg-transparent text-foreground hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
                            onClick={() => setOpen(true)}
                        >
                            <TrashIcon />
                        </Button>
                    </TooltipTrigger>
                </DialogTrigger>
                <TooltipContent className="select-none" color="destructive">
                    <Trans>Delete</Trans>
                </TooltipContent>
            </Tooltip>
            <DialogContent className="select-none">
                <DialogHeader>
                    <DialogTitle className="text-lg">
                        <Trans>
                            Are you sure you want to delete this firewall group?
                        </Trans>
                    </DialogTitle>
                    <DialogDescription className="text-popover-foreground">
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
                            <span className="font-mono">
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
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/80"
                        disabled={isDeleting}
                        onClick={() => handleConfirm()}
                    >
                        {
                            isDeleting && <Spinner />
                        }
                        <Trans>Confirm</Trans>
                    </Button>
                    <DialogClose asChild>
                        <Button className="cursor-pointer">
                            <Trans>Cancel</Trans>
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function TranslatedID({ value }: { value: string }) {
    switch (value) {
        case "ID":
            return <Trans>ID</Trans>;
        case "Description":
            return <Trans>Description</Trans>;
        case "Date Created":
            return <Trans>Date Created</Trans>;
        case "Last Modified":
            return <Trans>Last Modified</Trans>;
        case "Rules":
            return <Trans>Rules</Trans>;
        case "Instances":
            return <Trans>Instances</Trans>;
        default:
            return value;
    }
}

function GroupTable() {
    const groupsState = useAtomValue(VultrFirewall.groupsStateAtom);

    const { refetch } = useGroupsQuery();

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 5
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const data = useMemo(() => {
        return Object.values(groupsState).filter((groupState) => groupState !== undefined).map((groupState) => groupState.group);
    }, [groupsState]);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination
        }
    });

    const handleRefreshGroups = useCallback(async () => {
        setIsLoading(true);
        const res = await refetch();
        if (res.isError) {
            const message = res.error.message;
            toast.error(() => <Trans>Failed to refresh firewall groups</Trans>, { description: message });
        }
        setIsLoading(false);
    }, []);

    // const selectedRows = table.getFilteredSelectedRowModel().rows.length;
    // const totalRows = table.getFilteredRowModel().rows.length;

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter description..."
                    value={table.getColumn("Description")?.getFilterValue() as string ?? ""}
                    onChange={
                        (e) => table.getColumn("Description")?.setFilterValue(e.target.value)
                    }
                    className="max-w-3xs h-full"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto h-full dark:hover:bg-accent dark:hover:text-accent-foreground">
                            <Trans>Columns</Trans> <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {
                            table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(v) => column.toggleVisibility(v)}
                                    >
                                        <TranslatedID value={column.id} />
                                    </DropdownMenuCheckboxItem>
                                ))
                        }
                    </DropdownMenuContent>
                </DropdownMenu>
                <CreateGroupButton />
                {/* <Tooltip delayDuration={1000}>
                    <TooltipTrigger asChild>
                        <Button className="ml-2 h-full bg-accent text-accent-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground">
                            <PlusIcon />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <Trans>Create Group</Trans>
                    </TooltipContent>
                </Tooltip> */}
            </div>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {
                            table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="bg-accent hover:bg-accent/80">
                                    {
                                        headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className="text-accent-foreground">
                                                {
                                                    header.isPlaceholder ?
                                                        null :
                                                        flexRender(header.column.columnDef.header,
                                                            header.getContext()
                                                        )
                                                }
                                            </TableHead>
                                        ))
                                    }
                                </TableRow>
                            )
                            )
                        }
                    </TableHeader>
                    <TableBody>
                        {
                            table.getRowModel().rows?.length ?
                                (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                            {
                                                row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {
                                                            flexRender(cell.column.columnDef.cell, cell.getContext())
                                                        }
                                                    </TableCell>
                                                ))
                                            }
                                        </TableRow>
                                    ))
                                ) :
                                (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            <Trans>No results</Trans>
                                        </TableCell>
                                    </TableRow>
                                )
                        }
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-center space-x-2 py-4">
                {/* <div className="text-muted-foreground flex-1 text-sm">
                    <Trans>
                        {selectedRows} of {totalRows} row(s) selected.
                    </Trans>
                </div> */}
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeftIcon />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRightIcon />
                    </Button>
                </div>
            </div>
            <div className="flex gap-4 justify-center items-center flex-wrap">
                <Button
                    onClick={handleRefreshGroups}
                    disabled={isLoading}
                    className="cursor-pointer w-20 bg-accent text-accent-foreground hover:bg-accent/80"
                >
                    {
                        isLoading && <Spinner className="w-4" />
                    }
                    <Trans>Refresh</Trans>
                </Button>
                <ProxySwitch className="h-9 bg-accent text-accent-foreground hover:bg-accent/90" />
            </div>
        </div>
    );
}

export { GroupTable };
