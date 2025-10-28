import { Trans } from "@lingui/react/macro";
import type { useReactTable } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

import { Button, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "#components/ui";

import { TranslatedID } from "./group-table";

function ColumnsFilterSelect<T>({ table }: { table: ReturnType<typeof useReactTable<T>> }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="dark:hover:bg-accent dark:hover:text-accent-foreground">
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

export { ColumnsFilterSelect };
