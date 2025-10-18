import { useLingui } from "@lingui/react/macro";
import { useAtom, useSetAtom } from "jotai";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { setThemeAtom, Theme, themeAtom } from "@/store/theme";

import { SectionBlock } from "./section";

function ThemeBlock() {
    const { t } = useLingui();

    const [theme] = useAtom(themeAtom);
    const setTheme = useSetAtom(setThemeAtom);

    return (
        <SectionBlock className="flex-row bg-accent items-center px-4 py-2">
            <h2>{t`Theme`}</h2>
            <ToggleGroup
                type="single"
                value={theme}
                onValueChange={(value) => {
                    setTheme(value as Theme);
                }}
                className="ml-auto bg-primary-foreground"
            >
                <ToggleGroupItem value={Theme.AUTO} aria-label="Toggle auto">
                    <span className="text-sm">{t`Auto`}</span>
                </ToggleGroupItem>
                <ToggleGroupItem value={Theme.LIGHT} aria-label="Toggle auto">
                    <span className="text-sm">{t`Light`}</span>
                </ToggleGroupItem>
                <ToggleGroupItem value={Theme.DARK} aria-label="Toggle auto">
                    <span className="text-sm">{t`Dark`}</span>
                </ToggleGroupItem>
            </ToggleGroup>
        </SectionBlock>
    );
}

export { ThemeBlock };
