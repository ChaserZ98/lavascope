import { IPVersion } from "@lavascope/store";
import { VultrFirewall } from "@lavascope/store/firewlall";
import { Trans, useLingui } from "@lingui/react/macro";
import { type ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, type PaginationState, type SortingState, useReactTable, type VisibilityState } from "@tanstack/react-table";
import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { ChevronDown, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { ProxySwitch } from "#components/lavascope";
import { Button, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#components/ui";

import { DeleteRuleButton } from "./delete-rule-button";

type ColumnData = VultrFirewall.Rule & { groupId: string };

const idColumn: ColumnDef<ColumnData> = {
    id: "ID",
    accessorKey: "id",
    header: () => <div className="text-center">ID</div>,
    cell: ({ row, column }) => <div>{row.getValue(column.id)}</div>
};
const protocolColumn: ColumnDef<ColumnData> = {
    id: "Protocol",
    accessorKey: "protocol",
    header: () => <div className="text-center"><Trans>Protocol</Trans></div>,
    cell: ({ row, column }) => <div className="text-center">{row.getValue(column.id)}</div>
};
const portColumn: ColumnDef<ColumnData> = {
    id: "Port",
    accessorKey: "port",
    header: () => <div className="text-center"><Trans>Port</Trans></div>,
    cell: ({ row, column }) => <div className="text-center">{row.getValue(column.id)}</div>
};
const sourceTypeColumn: ColumnDef<ColumnData> = {
    id: "Source Type",
    accessorKey: "source",
    header: () => <div className="text-center"><Trans>Source Type</Trans></div>,
    cell: ({ row }) => {
        const { t } = useLingui();

        const rule = row.original;

        const sourceType = rule.source === "cloudflare" ?
            t`Cloudflare` :
            rule.subnet === "::" || rule.subnet === "0.0.0.0" ? t`Anywhere` : t`Custom`;
        return <div className="text-center">{sourceType}</div>;
    }
};
const sourceColumn: ColumnDef<ColumnData> = {
    id: "Source",
    accessorKey: "source",
    header: () => <div className="text-center"><Trans>Source</Trans></div>,
    cell: ({ row }) => {
        const rule = row.original;
        const value = rule.source === "cloudflare" ? "cloudflare" : `${rule.subnet}/${rule.subnet_size}`;
        return <div className="text-center">{value}</div>;
    }
};
const noteColumn: ColumnDef<ColumnData> = {
    id: "Notes",
    accessorKey: "notes",
    header: () => <div className="text-center"><Trans>Note</Trans></div>,
    cell: ({ row, column }) => <div className="text-center">{row.getValue(column.id)}</div>
};
const actionsColumn: ColumnDef<ColumnData> = {
    id: "Actions",
    accessorKey: "id",
    header: () => <div className="text-center"><Trans>Actions</Trans></div>,
    cell: ({ row }) => {
        const rule = row.original;
        return (
            <div className="flex gap-2 justify-center items-center">
                <DeleteRuleButton rule={rule} groupId={rule.groupId} />
            </div>
        );
    }
};

const columns: ColumnDef<ColumnData>[] = [
    protocolColumn,
    portColumn,
    sourceTypeColumn,
    sourceColumn,
    noteColumn,
    actionsColumn
];

function TranslatedID({ value }: { value: string }) {
    switch (value) {
        case "Protocol":
            return <Trans>Protocol</Trans>;
        case "Port":
            return <Trans>Port</Trans>;
        case "Source Type":
            return <Trans>Source Type</Trans>;
        case "Source":
            return <Trans>Source</Trans>;
        case "Notes":
            return <Trans>Notes</Trans>;
        case "Actions":
            return <Trans>Actions</Trans>;
        default:
            return value;
    }
}

function RulesTable({ groupId, ipVersion, rules, isLoading }: {
    groupId: string;
    ipVersion: IPVersion;
    rules: VultrFirewall.RuleState[];
    isLoading?: boolean;
}) {
    const newRuleAtom = useMemo(() => selectAtom(
        VultrFirewall.groupsStateAtom,
        (state) => state[groupId]?.newRule[ipVersion]
    ),
    [groupId, ipVersion]);

    const newRule = useAtomValue(newRuleAtom) || (ipVersion === IPVersion.V4 ? VultrFirewall.initialNewRuleIPv4 : VultrFirewall.initialNewRuleIPv6);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });

    const data = useMemo(() => {
        return rules.map((rule) => ({ ...rule.rule, groupId }));
    }, [rules, groupId]);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnVisibility,
            pagination
        }
    });

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                {/* <Input
                    placeholder="Filter description..."
                    value={table.getColumn("Description")?.getFilterValue() as string ?? ""}
                    onChange={
                        (e) => table.getColumn("Description")?.setFilterValue(e.target.value)
                    }
                    className="max-w-3xs h-full"
                /> */}
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
                {/* <Tooltip delayDuration={1000}>
                    <TooltipTrigger asChild>
                        <Button
                            className="ml-2 h-full bg-accent text-accent-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground"
                            onClick={handleRefreshRules}
                            disabled={isLoading}
                        >
                            <RefreshCwIcon className={isLoading ? "animate-spin" : ""} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="select-none">
                        <Trans>Refresh</Trans>
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

export { RulesTable };
