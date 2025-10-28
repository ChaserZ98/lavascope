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
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeftIcon, ChevronRightIcon, SquarePenIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ProxySwitch } from "#components/lavascope/proxy-switch";
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tooltip, TooltipContent, TooltipTrigger } from "#components/ui";
import { cn } from "#lib/utils";

import { ColumnsFilterSelect } from "./columns-filter-select";
import { CreateGroupButton } from "./create-group-button";
import { DeleteGroupButton } from "./delete-group-button";
import { RefreshButton } from "./refresh-button";
import { RowsPerPageSelect } from "./rows-per-page-select";

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

type ColumnData = Omit<VultrFirewall.GroupState, "newRule" | "newDescription"> & { isTableLoading: boolean };

const idColumn: ColumnDef<ColumnData> = {
    id: "ID",
    header: () => <div className="text-center">ID</div>,
    cell: ({ row }) => <div className="text-center">{row.original.group.id}</div>,
};
const descriptionColumn: ColumnDef<ColumnData> = {
    id: "Description",
    header: () => (
        <div className="w-fit mx-auto">
            <Trans>Description</Trans>
        </div>
    ),
    cell: ({ row }) => <div className="text-center">{row.original.group.description}</div>,
};
const dateCreatedColumn: ColumnDef<ColumnData> = {
    id: "Date Created",
    header: ({ column }) => {
        const sortedState = column.getIsSorted();
        const handleClick = () => {
            if (!sortedState) {
                column.toggleSorting(false);
            } else if (sortedState === "asc") {
                column.toggleSorting(true);
            } else {
                column.clearSorting();
            }
        };

        return (
            <div className="w-fit mx-auto">
                <Button
                    variant="ghost"
                    onClick={handleClick}
                >
                    <Trans>Date Created</Trans>
                    {
                        sortedState === false ? <ArrowUpDown /> : sortedState === "asc" ? <ArrowUp /> : <ArrowDown />
                    }
                </Button>
            </div>
        );
    },
    cell: ({ row }) => {
        const value = new Date(row.original.group.date_created).toLocaleString(
            Intl.DateTimeFormat().resolvedOptions().locale,
            {
                timeZoneName: "short",
                hour12: false,
            }
        );

        return <div className="text-center">{value}</div>;
    },
};
const lastModifiedColumn: ColumnDef<ColumnData> = {
    id: "Last Modified",
    header: ({ column }) => {
        const sortedState = column.getIsSorted();
        const handleClick = () => {
            if (!sortedState) {
                column.toggleSorting(false);
            } else if (sortedState === "asc") {
                column.toggleSorting(true);
            } else {
                column.clearSorting();
            }
        };

        return (
            <div className="w-fit mx-auto">
                <Button
                    variant="ghost"
                    onClick={handleClick}
                >
                    <Trans>Last Modified</Trans>
                    {
                        sortedState === false ? <ArrowUpDown /> : sortedState === "asc" ? <ArrowUp /> : <ArrowDown />
                    }
                </Button>
            </div>
        );
    },
    cell: ({ row }) => {
        const value = new Date(row.original.group.date_modified).toLocaleString(
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
const rulesColumn: ColumnDef<ColumnData> = {
    id: "Rules",
    header: () => <div className="text-center"><Trans>Rules</Trans></div>,
    cell: ({ row }) => <div className="text-center">{row.original.group.rule_count}</div>
};
const instancesColumn: ColumnDef<ColumnData> = {
    id: "Instances",
    header: () => <div className="text-center"><Trans>Instances</Trans></div>,
    cell: ({ row }) => <div className="text-center">{row.original.group.instance_count}</div>
};
const actionsColumn: ColumnDef<ColumnData> = {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-center"><Trans>Actions</Trans></div>,
    cell: ({ row }) => {
        const state = row.original;
        const group = state.group;
        const disabled = state.isTableLoading || state.isUpdating || state.isDeleting || state.isCreating;

        return (
            <div className="flex gap-2 justify-center items-center">
                <Tooltip delayDuration={1000}>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon-sm"
                            className={
                                cn(
                                    "bg-transparent text-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground",
                                    { "pointer-events-none opacity-50": disabled }
                                )
                            }
                            aria-disabled={disabled}
                            asChild
                        >
                            <Link
                                to="/groups/$id"
                                params={{ id: group.id }}
                            >
                                <SquarePenIcon />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="select-none" color="primary">
                        <Trans>Edit Rules</Trans>
                    </TooltipContent>
                </Tooltip>
                <DeleteGroupButton
                    group={group}
                    disabled={disabled}
                />
            </div>
        );
    },
};

const columns: ColumnDef<ColumnData>[] = [
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

    const data: ColumnData[] = useMemo(() => {
        return Object.values(groupsState).filter((groupState) => groupState !== undefined).map((state) => ({
            group: state.group,
            isCreating: state.isCreating,
            isUpdating: state.isUpdating,
            isDeleting: state.isDeleting,
            isTableLoading: isLoading
        }));
    }, [groupsState, isLoading]);

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

    const totalRows = table.getFilteredRowModel().rows.length;

    const pageSize = table.getState().pagination.pageSize;
    const pageSizeOptions = [5, 10, 20];

    return (
        <div className="w-full">
            <div className="flex justify-between items-center py-4 gap-2">
                <div>
                    <Input
                        placeholder="Filter description..."
                        value={table.getColumn("Description")?.getFilterValue() as string ?? ""}
                        onChange={
                            (e) => table.getColumn("Description")?.setFilterValue(e.target.value)
                        }
                        className="max-w-3xs h-full"
                    />
                </div>
                <div className="flex items-center">
                    <ColumnsFilterSelect table={table} />
                    <CreateGroupButton />
                    <RefreshButton isLoading={isLoading} onClick={handleRefreshGroups} />
                </div>
            </div>
            <div className="overflow-hidden rounded-md border">
                <Table className={isLoading ? "animate-pulse" : ""}>
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
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                            className={row.original.isCreating || row.original.isUpdating || row.original.isDeleting ? "animate-pulse" : ""}
                                        >
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
                <div className="flex space-x-2 sm:absolute">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage() || isLoading}
                    >
                        <ChevronLeftIcon />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage() || isLoading}
                    >
                        <ChevronRightIcon />
                    </Button>
                    <RowsPerPageSelect
                        pageSizeOptions={pageSizeOptions}
                        value={pageSize.toString()}
                        onValueChange={(v) => table.setPageSize(parseInt(v))}
                        disabled={isLoading}
                    />
                </div>
                <div className="ml-auto">
                    <Trans>{totalRows} row(s) in total</Trans>
                </div>
            </div>
            <div className="flex gap-4 justify-center items-center flex-wrap">
                <ProxySwitch className="h-9 bg-accent text-accent-foreground hover:bg-accent/90" />
            </div>
        </div>
    );
}

export { GroupTable, TranslatedID };
