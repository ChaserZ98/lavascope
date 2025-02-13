import {
    Button,
    Link as HeroUILink,
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Tooltip,
} from "@heroui/react";
import { mdiCog, mdiIpOutline, mdiThemeLightDark, mdiWall } from "@mdi/js";
import Icon from "@mdi/react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";

import { Screen, screenSizeAtom } from "@/store/screen";
import { toggleThemeAtom } from "@/store/theme";

export function BottomNavigation() {
    return (
        <div className="flex bottom-0 right-0 border-t-1 border-divider w-full h-28 bg-content1 transition-colors-opacity md:hidden">
            <HeroUILink
                to="/groups"
                color="foreground"
                size="lg"
                isBlock
                as={Link}
                className="flex flex-col justify-center items-center w-1/2 h-full transition-colors-opacity text-medium"
                activeProps={{
                    className: "text-primary",
                }}
            >
                <Icon path={mdiWall} className="w-8" />
                <p>Groups</p>
            </HeroUILink>
            <HeroUILink
                to="/my-ip"
                color="foreground"
                size="lg"
                isBlock
                as={Link}
                className="flex flex-col justify-center items-center w-1/2 h-full transition-colors-opacity text-medium text-foreground"
                activeProps={{
                    className: "text-primary",
                }}
            >
                <Icon path={mdiIpOutline} className="w-8" />
                <p>My IP</p>
            </HeroUILink>
        </div>
    );
}

export default function Navigation() {
    const location = useLocation();

    const toggleTheme = useSetAtom(toggleThemeAtom);
    const screenSize = useAtomValue(screenSizeAtom);

    return (
        <Navbar
            shouldHideOnScroll
            classNames={{
                base: "border-b-1 border-divider select-none transition-colors-opacity",
            }}
        >
            <NavbarBrand className="text-foreground">
                <HeroUILink
                    to="/"
                    color="foreground"
                    size={screenSize === Screen.SM ? "sm" : "lg"}
                    isBlock
                    as={Link}
                    className="text-medium text-wrap sm:text-large transition-colors-opacity"
                >
                    Vultr Firewall Watcher
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
                        Groups
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
                        My IP
                    </HeroUILink>
                </NavbarItem>
            </NavbarContent>
            <NavbarContent
                justify="end"
                className="data-[justify=end]:flex-grow-0 sm:data-[justify=end]:flex-grow"
            >
                <NavbarItem>
                    <Tooltip
                        content="Theme"
                        delay={500}
                        closeDelay={150}
                        classNames={{
                            content: "transition-colors-opacity",
                        }}
                    >
                        <Button
                            isIconOnly
                            onPress={() => toggleTheme()}
                            className="p-0.5 min-w-8 w-8 h-8 sm:p-1 sm:min-w-10 sm:w-10 sm:h-10 text-default-foreground"
                        >
                            <Icon path={mdiThemeLightDark} className="w-full" />
                        </Button>
                    </Tooltip>
                </NavbarItem>
                <NavbarItem
                    isActive={location.pathname === "/settings"}
                    className="group/settings"
                >
                    <Tooltip
                        content="Settings"
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
                            className="p-0.5 min-w-[32px] w-[32px] h-[32px] sm:p-1 sm:min-w-10 sm:w-10 sm:h-10 text-default-foreground"
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
