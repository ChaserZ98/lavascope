import { ColorScheme, colorSchemeAtom, setColorSchemeAtom } from "@lavascope/store";
import { IconBrightness } from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";
import * as React from "react";

import { Button } from "#components/ui";

export function ModeToggle() {
    const colorScheme = useAtomValue(colorSchemeAtom);
    const setColorScheme = useSetAtom(setColorSchemeAtom);

    const toggleTheme = React.useCallback(() => {
        setColorScheme(colorScheme === ColorScheme.DARK ? ColorScheme.LIGHT : ColorScheme.DARK);
    }, [colorScheme, setColorScheme]);

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
