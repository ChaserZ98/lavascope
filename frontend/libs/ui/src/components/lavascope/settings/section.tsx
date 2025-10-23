import React from "react";

import { Separator } from "#components/ui";
import { cn } from "#lib/utils";

interface SectionProps extends React.PropsWithChildren {
    header?: string;
    classNames?: {
        base: string;
        header: string;
    };
}

export const Section: React.FC<SectionProps> = (props) => {
    const baseClassName = cn("w-full", props.classNames?.base);
    const headerClassName = cn("text-2xl", props.classNames?.header);

    return (
        <div className={baseClassName}>
            {props.header && (
                <SectionHeader
                    className={headerClassName}
                    header={props.header}
                />
            )}
            {props.children}
            <Separator />
        </div>
    );
};

interface SectionHeaderProps extends React.ComponentProps<"h2"> {
    header: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = (props) => {
    return (
        <h2
            className={cn(
                props.className ||
                "pl-4 text-xs font-bold text-foreground transition-colors-opacity sm:text-sm"
            )}
        >
            {props.header}
        </h2>
    );
};

export const SectionBody: React.FC<React.ComponentProps<"div">> = (props) => {
    const bodyClassName = cn("flex flex-col py-4 space-y-2", props.className);
    return (
        <div {...props} className={bodyClassName}>
            {props.children}
        </div>
    );
};

export const SectionBlock: React.FC<React.ComponentProps<"div">> = (props) => {
    const blockClassName =
        cn(
            "flex overflow-hidden w-full",
            props.className,
        );
    return (
        <div {...props} className={blockClassName}>
            {props.children}
        </div>
    );
};
