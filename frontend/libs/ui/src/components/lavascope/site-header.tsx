import { type MacroMessageDescriptor, msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react/macro";
import { useRouterState } from "@tanstack/react-router";

import { Separator, SidebarTrigger } from "#components/ui";

const titleDescriptor: Record<string, MacroMessageDescriptor> = {
    "groups": msg`Groups`,
    "my ip": msg`My IP`,
    "settings": msg`Settings`,
    "help": msg`Help`,
    "about": msg`About`,
};

export function SiteHeader() {
    const { location } = useRouterState();
    const { t } = useLingui();

    const title = location.pathname.slice(1).replaceAll("-", " ");
    const localizedTitle = titleDescriptor[title] ? t(titleDescriptor[title]) : title;

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <h1 className="text-base font-medium capitalize">
                    {localizedTitle}
                </h1>
                {/* <div className="ml-auto flex items-center gap-2">
                    <ThemeSelector />
                </div> */}
            </div>
        </header>
    );
}
