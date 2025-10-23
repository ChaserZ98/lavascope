import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "#lib/utils";

function TooltipProvider({
    delayDuration = 0,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
    return (
        <TooltipPrimitive.Provider
            data-slot="tooltip-provider"
            delayDuration={delayDuration}
            {...props}
        />
    );
}

function Tooltip({
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
    return (
        <TooltipProvider>
            <TooltipPrimitive.Root data-slot="tooltip" {...props} />
        </TooltipProvider>
    );
}

function TooltipTrigger({
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
    return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

type TooltipContentProps = {
    color?: "default" | "primary" | "secondary" | "destructive";
};
function TooltipContent({
    className,
    sideOffset = 0,
    children,
    color = "default",
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & TooltipContentProps) {
    const contentClassName = cn(
        "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
        {
            "bg-foreground text-background": color === "default",
            "bg-primary text-primary-foreground": color === "primary",
            "bg-secondary text-secondary-foreground": color === "secondary",
            "bg-destructive text-destructive-foreground": color === "destructive",
        },
        className
    );

    const arrowClassName = cn(
        "bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]",
        {
            "bg-foreground fill-foreground": color === "default",
            "bg-primary fill-primary": color === "primary",
            "bg-secondary fill-secondary": color === "secondary",
            "bg-destructive fill-destructive": color === "destructive",
        }
    );

    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
                data-slot="tooltip-content"
                sideOffset={sideOffset}
                className={contentClassName}
                {...props}
            >
                {children}
                <TooltipPrimitive.Arrow className={arrowClassName} />
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
    );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
