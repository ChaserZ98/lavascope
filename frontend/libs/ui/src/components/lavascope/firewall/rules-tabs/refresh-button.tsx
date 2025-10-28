import { Trans } from "@lingui/react/macro";
import { RefreshCwIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { Button, Tooltip, TooltipContent, TooltipTrigger } from "#components/ui";

function RefreshButton({ isLoading, ...props }: { isLoading: boolean } & ComponentProps<typeof Button>) {
    return (
        <Tooltip delayDuration={1000}>
            <TooltipTrigger asChild>
                <Button
                    className="ml-2 h-full bg-accent text-accent-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    disabled={isLoading}
                    {...props}
                >
                    <RefreshCwIcon className={isLoading ? "animate-spin" : ""} />
                </Button>
            </TooltipTrigger>
            <TooltipContent className="select-none" color="primary">
                <Trans>Refresh</Trans>
            </TooltipContent>
        </Tooltip>
    );
}
export { RefreshButton };
