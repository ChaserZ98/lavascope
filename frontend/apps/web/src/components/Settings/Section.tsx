import { cn } from "@heroui/react";
import React from "react";

interface SectionProps extends React.PropsWithChildren {
    header?: string;
    classNames?: {
        base: string;
        header: string;
    };
}

export const Section: React.FC<SectionProps> = (props) => {
    const baseClassName =
        props.classNames?.base || "flex flex-col max-w-[400px] w-full";

    return (
        <div className={baseClassName}>
            {props.header && (
                <SectionHeader
                    className={props.classNames?.header}
                    header={props.header}
                />
            )}
            {props.children}
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
    const bodyClassName = props.className || "flex flex-col py-2";
    return (
        <div {...props} className={bodyClassName}>
            {props.children}
        </div>
    );
};

export const SectionBlock: React.FC<React.ComponentProps<"div">> = (props) => {
    const blockClassName =
        props.className ??
        "flex flex-col overflow-hidden w-full border-b-1 border-default transition-colors first:rounded-t-large last:rounded-b-large last:border-b-0";
    return (
        <div {...props} className={blockClassName}>
            {props.children}
        </div>
    );
};
