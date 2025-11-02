import { type Icon } from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";
import * as React from "react";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "#components/ui";

export type NavSecondaryItem = {
    title: string;
    url: string;
    icon: Icon;
    target?: never;
    external?: never;
} | {
    title: string;
    url: string;
    icon: Icon;
    target: "_blank";
    external: true;
};

export function NavSecondary({
    items,
    ...props
}: {
    items: NavSecondaryItem[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    const { location: { pathname } } = useRouterState();

    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                {
                                    item.external ?
                                        (
                                            <a href={item.url} target={item.target} rel="noreferrer">
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </a>
                                        ) :
                                        (
                                            <Link to={item.url} data-active={pathname.startsWith(item.url)}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        )
                                }
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
