import { Button, Tooltip } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { mdiThemeLightDark } from "@mdi/js";
import Icon from "@mdi/react";
import { useSetAtom } from "jotai";

import { toggleThemeAtom } from "@/store/theme";

export default function ThemeSwitch() {
    const { t } = useLingui();

    const toggleTheme = useSetAtom(toggleThemeAtom);

    return (
        <Tooltip
            content={t`Theme`}
            delay={500}
            closeDelay={150}
            classNames={{
                content: "transition-colors-opacity",
            }}
        >
            <Button
                isIconOnly
                onPress={toggleTheme}
                className="p-0.5 min-w-9 w-9 h-9 sm:p-1 sm:min-w-10 sm:w-10 sm:h-10 text-default-foreground"
            >
                <Icon path={mdiThemeLightDark} className="w-full" />
            </Button>
        </Tooltip>
    );
}
