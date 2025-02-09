import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
    Button,
    Link as HeroUILink,
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuToggle,
    Tooltip,
} from "@heroui/react";
import { mdiCog, mdiThemeLightDark } from "@mdi/js";
import Icon from "@mdi/react";

import { Environment, environmentAtom } from "@/store/environment";
import { Screen, screenSizeAtom } from "@/store/screen";
import { toggleThemeAtom } from "@/store/theme";
import { useAtomValue, useSetAtom } from "jotai";

export default function Navigation() {
    const location = useLocation();

    const toggleTheme = useSetAtom(toggleThemeAtom);
    const environment = useAtomValue(environmentAtom);
    const screenSize = useAtomValue(screenSizeAtom);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <Navbar
            shouldHideOnScroll
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
            classNames={{
                base: "select-none transition-colors-opacity",
            }}
        >
            <NavbarMenuToggle
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                className="md:hidden text-foreground transition-colors-opacity"
            />
            <NavbarBrand className="text-foreground">
                <HeroUILink
                    to="/"
                    color="foreground"
                    size={screenSize === Screen.SM ? "sm" : "lg"}
                    isBlock
                    as={Link}
                    className="text-medium text-wrap sm:text-large transition-colors-opacity"
                    onPress={() => setIsMenuOpen(false)}
                >
                    Vultr Firewall Watcher
                </HeroUILink>
            </NavbarBrand>
            <NavbarContent justify="center" className="hidden md:flex gap-4">
                <NavbarItem isActive={location.pathname === "/"}>
                    <HeroUILink
                        to="/"
                        color="foreground"
                        size="lg"
                        isBlock
                        as={Link}
                        className="transition-colors-opacity"
                    >
                        Groups
                    </HeroUILink>
                </NavbarItem>
                <NavbarItem isActive={location.pathname === "/my-ip"}>
                    <HeroUILink
                        to="/my-ip"
                        color="foreground"
                        size="lg"
                        isBlock
                        as={Link}
                        className="transition-colors-opacity"
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
                                className="w-full animate-[spin_3s_linear_infinite] hover:[animation-play-state:running] [animation-play-state:paused] group-data-[active=true]/settings:[animation-play-state:running]"
                            />
                        </Button>
                    </Tooltip>
                </NavbarItem>
            </NavbarContent>
            <NavbarMenu
                id="navbar-menu"
                className="transition-colors-opacity"
                style={
                    {
                        "--navbar-height":
                            environment === Environment.WINDOWS
                                ? "6rem"
                                : "4rem",
                    } as React.CSSProperties
                }
            >
                <NavbarItem isActive={location.pathname === "/"}>
                    <HeroUILink
                        to="/"
                        color="foreground"
                        size="lg"
                        isBlock
                        as={Link}
                        className="transition-colors-opacity text-medium"
                        onPress={() => setIsMenuOpen(false)}
                    >
                        Groups
                    </HeroUILink>
                </NavbarItem>
                <NavbarItem isActive={location.pathname === "/my-ip"}>
                    <HeroUILink
                        to="/my-ip"
                        color="foreground"
                        size="lg"
                        isBlock
                        as={Link}
                        className="transition-colors-opacity text-medium"
                        onPress={() => setIsMenuOpen(false)}
                    >
                        My IP
                    </HeroUILink>
                </NavbarItem>
            </NavbarMenu>
        </Navbar>
    );
}
