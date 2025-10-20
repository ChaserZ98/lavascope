import { useLingui } from "@lingui/react/macro";
import {
    IconHelp,
    IconInfoCircle,
    IconSettings,
    IconWall,
    IconWorldSearch,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import * as React from "react";

import { NavMain } from "@/components/lavascope/nav-main";
import { NavSecondary, type NavSecondaryItem } from "@/components/lavascope/nav-secondary";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { t } = useLingui();

    const navigation = React.useMemo(() => [
        {
            title: t`Groups`,
            url: "/groups",
            icon: IconWall,
        },
        {
            title: t`My IP`,
            url: "/my-ip",
            icon: IconWorldSearch,
        },
    ], [t]);

    const bottomNav = React.useMemo(() => [
        {
            title: t`Settings`,
            url: "/settings",
            icon: IconSettings,
        },
        {
            title: t`Help`,
            url: "https://github.com/chaserz98/lavascope",
            icon: IconHelp,
            target: "_blank"
        },
        {
            title: t`About`,
            url: "/about",
            icon: IconInfoCircle,
        }
    ] as NavSecondaryItem[], [t]);

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <Link to="/">
                                <img src="/favicon.ico" className="!size-8" />
                                <span className="text-base font-semibold">LavaScope</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navigation} />
                <NavSecondary items={bottomNav} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter></SidebarFooter>
        </Sidebar>
    );
}
