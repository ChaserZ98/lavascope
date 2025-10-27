import { VultrFirewall } from "@lavascope/store/firewlall";
import { Trans, useLingui } from "@lingui/react/macro";
import { type ColumnDef, flexRender, useReactTable } from "@tanstack/react-table";
import { ArrowUpDownIcon, ChevronDown, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#components/ui";

import { DeleteRuleButton } from "./delete-rule-button";

type ColumnData = VultrFirewall.Rule & { groupId: string };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const idColumn: ColumnDef<ColumnData> = {
    id: "ID",
    accessorKey: "id",
    header: () => <div className="text-center">ID</div>,
    cell: ({ row, column }) => <div>{row.getValue(column.id)}</div>
};
const protocolColumn: ColumnDef<ColumnData> = {
    id: "Protocol",
    accessorKey: "protocol",
    header: ({ column }) => (
        <div className="text-center">
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                <Trans>Protocol</Trans>
                <ArrowUpDownIcon />
            </Button>
        </div>
    ),
    cell: ({ row, column }) => <div className="uppercase text-center">{row.getValue(column.id)}</div>
};
const portColumn: ColumnDef<ColumnData> = {
    id: "Port",
    accessorKey: "port",
    sortingFn: (rowA, rowB) => {
        const portA = parseInt(rowA.original.port);
        const portB = parseInt(rowB.original.port);
        if (portA === portB) return 0;
        if (!isNaN(portA) && !isNaN(portB)) return portA - portB;
        if (isNaN(portA) && !isNaN(portB)) return -1;
        return 1;
    },
    header: ({ column }) => (
        <div className="text-center">
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                <Trans>Port</Trans>
                <ArrowUpDownIcon />
            </Button>
        </div>
    ),
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

function ColumnsSelector<T>({ table }: { table: ReturnType<typeof useReactTable<T>> }) {
    return (
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
    );
}

function RulesTable({ table, isLoading }: {
    table: ReturnType<typeof useReactTable<ColumnData>>;
    isLoading?: boolean;
}) {
    return (
        <div className="w-full">
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
                </div>
            </div>
        </div>
    );
}

export { columns, ColumnsSelector, RulesTable, TranslatedID };
