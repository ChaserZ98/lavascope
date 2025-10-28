import { Trans } from "@lingui/react/macro";
import type { ComponentProps } from "react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger } from "#components/ui";

function RowsPerPageSelect({ pageSizeOptions, value, ...props }: ComponentProps<typeof Select> & { pageSizeOptions: number[] }) {
    return (
        <Select value={value} {...props}>
            <SelectTrigger size="sm">
                <p>{value}</p>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>
                        <Trans>Rows per page</Trans>
                    </SelectLabel>
                    {
                        pageSizeOptions.map((size, index) => (<SelectItem key={index} value={size.toString()}>{size}</SelectItem>))
                    }
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

export { RowsPerPageSelect };
