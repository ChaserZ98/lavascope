import { setThemeAtom, Theme, themeAtom } from "@lavascope/store";
import { IconBrightness } from "@tabler/icons-react";
import { useAtom, useSetAtom } from "jotai";
import * as React from "react";

import { Button } from "@/components/ui";

export function ModeToggle() {
    const [theme] = useAtom(themeAtom);
    const setTheme = useSetAtom(setThemeAtom);

    const toggleTheme = React.useCallback(() => {
        setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK);
    }, [theme, setTheme]);

    return (
        <Button
            variant="secondary"
            size="icon"
            className="group/toggle size-8"
            onClick={toggleTheme}
        >
            <IconBrightness />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
