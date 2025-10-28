import { VultrFirewall } from "@lavascope/store/firewlall";
import { Trans } from "@lingui/react/macro";
import { type ColumnDef, flexRender, useReactTable } from "@tanstack/react-table";
import { ArrowUpDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#components/ui";

import { DeleteRuleButton } from "./delete-rule-button";
import { RowsPerPageSelect } from "./rows-per-page-select";

type ColumnData = VultrFirewall.RuleState & { groupId: string; isTableLoading: boolean };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const idColumn: ColumnDef<ColumnData> = {
    id: "ID",
    header: () => <div className="text-center">ID</div>,
    cell: ({ row }) => <div>{row.original.rule.id}</div>
};
const protocolColumn: ColumnDef<ColumnData> = {
    id: "Protocol",
    header: ({ column }) => {
        return (
            <div className="text-center">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <Trans>Protocol</Trans>
                    <ArrowUpDownIcon />
                </Button>
            </div>
        );
    },
    cell: ({ row }) => <div className="uppercase text-center">{row.original.rule.protocol}</div>
};
const portColumn: ColumnDef<ColumnData> = {
    id: "Port",
    sortingFn: (rowA, rowB) => {
        const portA = parseInt(rowA.original.rule.port);
        const portB = parseInt(rowB.original.rule.port);
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
    cell: ({ row }) => <div className="text-center">{row.original.rule.port}</div>
};
const sourceTypeColumn: ColumnDef<ColumnData> = {
    id: "Source Type",
    header: () => <div className="text-center"><Trans>Source Type</Trans></div>,
    cell: ({ row }) => {
        const rule = row.original.rule;

        const sourceType = rule.source === "cloudflare" ?
            <Trans>Cloudflare</Trans> :
            rule.subnet === "::" || rule.subnet === "0.0.0.0" ? <Trans>Anywhere</Trans> : <Trans>Custom</Trans>;
        return <div className="text-center">{sourceType}</div>;
    }
};
const sourceColumn: ColumnDef<ColumnData> = {
    id: "Source",
    header: () => <div className="text-center"><Trans>Source</Trans></div>,
    cell: ({ row }) => {
        const rule = row.original.rule;
        const value = rule.source === "cloudflare" ? "cloudflare" : `${rule.subnet}/${rule.subnet_size}`;
        return <div className="text-center">{value}</div>;
    }
};
const noteColumn: ColumnDef<ColumnData> = {
    id: "Notes",
    header: () => <div className="text-center"><Trans>Note</Trans></div>,
    cell: ({ row }) => <div className="text-center">{row.original.rule.notes}</div>
};
const actionsColumn: ColumnDef<ColumnData> = {
    id: "Actions",
    accessorKey: "id",
    header: () => <div className="text-center"><Trans>Actions</Trans></div>,
    cell: ({ row }) => {
        const rule = row.original.rule;
        const groupId = row.original.groupId;
        const disabled = row.original.isTableLoading || row.original.isCreating || row.original.isDeleting;
        return (
            <div className="flex gap-2 justify-center items-center">
                <DeleteRuleButton rule={rule} groupId={groupId} disabled={disabled} />
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

function RulesTable({ table, isLoading }: {
    table: ReturnType<typeof useReactTable<ColumnData>>;
    isLoading?: boolean;
}) {
    const totalRows = table.getFilteredRowModel().rows.length;

    const pageSize = table.getState().pagination.pageSize;
    const pageSizeOptions = [5, 10, 20];

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
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className={row.original.isCreating || row.original.isDeleting ? "animate-pulse" : ""}>
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
        </div>
    );
}

export { type ColumnData, columns, RulesTable, TranslatedID };
