import { VultrFirewall } from "@lavascope/store/firewlall";
import { Trans } from "@lingui/react/macro";
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
import { useAtomValue } from "jotai";
import { ArrowUpDown, ChevronDown, SquarePenIcon, TrashIcon } from "lucide-react";
import { useState } from "react";

import { Button, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#components/ui";

const data: Payment[] = [
    {
        id: "m5gr84i9",
        amount: 316,
        status: "success",
        email: "ken99@example.com",
    },
    {
        id: "3u1reuv4",
        amount: 242,
        status: "success",
        email: "Abe45@example.com",
    },
    {
        id: "derv1ws0",
        amount: 837,
        status: "processing",
        email: "Monserrat44@example.com",
    },
    {
        id: "5kma53ae",
        amount: 874,
        status: "success",
        email: "Silas22@example.com",
    },
    {
        id: "bhqecj4p",
        amount: 721,
        status: "failed",
        email: "carmella@example.com",
    },
    {
        id: "bhqecj4pf",
        amount: 123,
        status: "failed",
        email: "carmella@example.com",
    },
];

export type Payment = {
    id: string;
    amount: number;
    status: "pending" | "processing" | "success" | "failed";
    email: string;
};

export const columns: ColumnDef<Payment>[] = [
    // {
    //     id: "select",
    //     header: ({ table }) => (
    //         <Checkbox
    //             checked={
    //                 table.getIsAllPageRowsSelected() ||
    //                 (table.getIsSomePageRowsSelected() && "indeterminate")
    //             }
    //             className="border-accent-foreground"
    //             onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //             aria-label="Select all"
    //         />
    //     ),
    //     cell: ({ row }) => (
    //         <Checkbox
    //             checked={row.getIsSelected()}
    //             onCheckedChange={(value) => row.toggleSelected(!!value)}
    //             aria-label="Select row"
    //         />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    // },
    {
        accessorKey: "status",
        header: () => <div className="text-center"><Trans>ID</Trans></div>,
        cell: ({ row }) => (
            <div className="capitalize text-center">{row.getValue("status")}</div>
        ),
    },
    {
        accessorKey: "email",
        header: ({ column }) => (
            <div className="w-fit mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <Trans>Description</Trans>
                    <ArrowUpDown />
                </Button>
            </div>
        ),
        cell: ({ row }) => <div className="lowercase text-center">{row.getValue("email")}</div>,
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-center"><Trans>Date Created</Trans></div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));

            // Format the amount as a dollar amount
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount);

            return <div className="text-center font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: "lastModified",
        header: () => (<div className="text-center"><Trans>Last Modified</Trans></div>),
        cell: ({ row }) => (
            <div className="text-center">date</div>
        ),
    },
    {
        accessorKey: "rules",
        header: () => <div className="text-center"><Trans>Rules</Trans></div>,
        cell: ({ row }) => <div className="text-center">8</div>
    },
    {
        accessorKey: "instances",
        header: () => <div className="text-center"><Trans>Instances</Trans></div>,
        cell: ({ row }) => <div className="text-center">8</div>
    },
    {
        id: "actions",
        enableHiding: false,
        header: () => <div className="text-center"><Trans>Actions</Trans></div>,
        cell: ({ row }) => {
            const payment = row.original;
            return (
                <div className="flex gap-2 justify-center items-center">
                    <Button size="sm" className="bg-transparent text-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground" onClick={() => navigator.clipboard.writeText(payment.id)}>
                        <SquarePenIcon />
                    </Button>
                    <Button size="sm" className="bg-transparent text-foreground hover:bg-destructive hover:text-destructive-foreground cursor-pointer">
                        <TrashIcon />
                    </Button>
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
    },
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

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter emails..."
                    value={table.getColumn("email")?.getFilterValue() as string ?? ""}
                    onChange={
                        (e) => table.getColumn("email")?.setFilterValue(e.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
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
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(v) => column.toggleVisibility(v)}
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                ))
                        }
                    </DropdownMenuContent>
                </DropdownMenu>
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
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )
                        }
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                    {
                        table.getFilteredSelectedRowModel().rows.length
                    } of {" "}
                    {
                        table.getFilteredRowModel().rows.length
                    } row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

export { GroupTable };
