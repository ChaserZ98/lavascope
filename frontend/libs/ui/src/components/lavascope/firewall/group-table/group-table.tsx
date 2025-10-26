import { useVultrAPI } from "@lavascope/hook";
import logging from "@lavascope/log";
import { IPVersion } from "@lavascope/store";
import { VultrFirewall } from "@lavascope/store/firewlall";
import { Trans } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { type ColumnDef, type ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, type PaginationState, type RowSelectionState, type SortingState, useReactTable, type VisibilityState } from "@tanstack/react-table";
import { produce } from "immer";
import { useAtomValue, useSetAtom } from "jotai";
import { ArrowUpDown, ChevronDown, ChevronLeftIcon, ChevronRightIcon, RefreshCwIcon, SquarePenIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ProxySwitch } from "#components/lavascope/proxy-switch";
import { Button, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tooltip, TooltipContent, TooltipTrigger } from "#components/ui";

import { CreateGroupButton } from "./create-group-button";
import { DeleteGroupButton } from "./delete-group-button";

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
    cell: ({ row, column }) => <div className="text-center">{row.getValue(column.id)}</div>,
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
                        <Button size="icon-sm" className="bg-transparent text-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground" asChild>
                            <Link to="/groups/$id" params={{ id: row.original.id }}>
                                <SquarePenIcon />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="select-none" color="primary">
                        <Trans>Edit Rules</Trans>
                    </TooltipContent>
                </Tooltip>
                <DeleteGroupButton group={group} />
            </div>
        );
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
                <Tooltip delayDuration={1000}>
                    <TooltipTrigger asChild>
                        <Button
                            className="ml-2 h-full bg-accent text-accent-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground"
                            onClick={handleRefreshGroups}
                            disabled={isLoading}
                        >
                            <RefreshCwIcon className={isLoading ? "animate-spin" : ""} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="select-none">
                        <Trans>Refresh</Trans>
                    </TooltipContent>
                </Tooltip>
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
                                            <Trans>Empty</Trans>
                                        </TableCell>
                                    </TableRow>
                                )
                        }
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-center space-x-2 py-4">
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
                <ProxySwitch className="h-9 bg-accent text-accent-foreground hover:bg-accent/90" />
            </div>
        </div>
    );
}

export { GroupTable };
