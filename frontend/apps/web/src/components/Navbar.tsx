// import {
//     Button,
//     Link as HeroUILink,
//     Navbar,
//     NavbarBrand,
//     NavbarContent,
//     NavbarItem,
//     Tooltip,
// } from "@heroui/react";
// import { Image } from "@heroui/react";
import { Screen, screenSizeAtom } from "@lavascope/store";
import { Trans, useLingui } from "@lingui/react/macro";
import { mdiCog, mdiIpOutline, mdiWall } from "@mdi/js";
import Icon from "@mdi/react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAtomValue } from "jotai";

import appIcon from "@/assets/img/app-icon.png";

import ThemeSwitch from "./ThemeSwitch";

export function BottomNavigation() {
    return (
        <div className="fixed flex bottom-0 left-0 border-t-1 border-divider w-full pb-[env(safe-area-inset-bottom)] h-[calc(4rem+env(safe-area-inset-bottom))] bg-content1 transition-colors-opacity md:hidden">
            <HeroUILink
                to="/groups"
                color="foreground"
                size="lg"
                isBlock
                as={Link}
                className="flex flex-col justify-center items-center py-2 w-1/2 h-full transition-colors-opacity text-sm text-foreground"
                activeProps={{
                    className: "text-primary",
                }}
            >
                <Icon path={mdiWall} className="w-6 h-6" />
                <p>
                    <Trans>Groups</Trans>
                </p>
            </HeroUILink>
            <HeroUILink
                to="/my-ip"
                color="foreground"
                size="lg"
                isBlock
                as={Link}
                className="flex flex-col justify-center items-center py-2 w-1/2 h-full transition-colors-opacity text-sm text-foreground"
                activeProps={{
                    className: "text-primary",
                }}
            >
                <Icon path={mdiIpOutline} className="w-6 h-6" />
                <p>
                    <Trans>My IP</Trans>
                </p>
            </HeroUILink>
        </div>
    );
}

export function Navigation() {
    const location = useLocation();

    const screenSize = useAtomValue(screenSizeAtom);

    const { t } = useLingui();

    return (
        <Navbar
            shouldHideOnScroll
            classNames={{
                base: "pt-[env(safe-area-inset-top)] border-b-1 border-divider select-none transition-colors-opacity",
            }}
        >
            <NavbarBrand className="text-foreground">
                <HeroUILink
                    to="/"
                    color="foreground"
                    size={screenSize === Screen.SM ? "sm" : "lg"}
                    isBlock
                    as={Link}
                    className="flex items-center justify-center"
                >
                    <Image
                        alt="LavaScope Logo"
                        src={appIcon}
                        className="px-1 w-10"
                    />
                    <h1 className="text-medium text-wrap sm:text-large transition-colors-opacity">
                        LavaScope
                    </h1>
                </HeroUILink>
            </NavbarBrand>
            <NavbarContent justify="center" className="hidden md:flex gap-4">
                <NavbarItem>
                    <HeroUILink
                        to="/groups"
                        color="foreground"
                        size="lg"
                        isBlock
                        as={Link}
                        className="transition-colors-opacity"
                        activeProps={{ className: "text-focus" }}
                    >
                        <Trans>Groups</Trans>
                    </HeroUILink>
                </NavbarItem>
                <NavbarItem>
                    <HeroUILink
                        to="/my-ip"
                        color="foreground"
                        size="lg"
                        isBlock
                        as={Link}
                        className="transition-colors-opacity"
                        activeProps={{ className: "text-focus" }}
                    >
                        <Trans>My IP</Trans>
                    </HeroUILink>
                </NavbarItem>
            </NavbarContent>
            <NavbarContent
                justify="end"
                className="data-[justify=end]:flex-grow-0 sm:data-[justify=end]:flex-grow"
            >
                <NavbarItem>
                    <ThemeSwitch />
                </NavbarItem>
                <NavbarItem
                    isActive={location.pathname === "/settings"}
                    className="group/settings"
                >
                    <Tooltip
                        content={t`Settings`}
                        delay={500}
                        closeDelay={150}
                        classNames={{
                            content: "transition-colors-opacity",
                        }}
                    >
                        <Button
                            to="/settings"
                            isIconOnly
                            as={Link}
                            className="p-0.5 min-w-9 w-9 h-9 sm:p-1 sm:min-w-10 sm:w-10 sm:h-10 text-default-foreground"
                        >
                            <Icon
                                path={mdiCog}
                                className="w-full animate-[spin_3s_linear_infinite] [animation-play-state:paused] group-data-[active=true]/settings:[animation-play-state:running] group-hover/settings:[animation-play-state:running]"
                            />
                        </Button>
                    </Tooltip>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}
