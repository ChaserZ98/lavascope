import { setThemeAtom, Theme, themeAtom } from "@lavascope/store";
import { Trans } from "@lingui/react/macro";
import { useAtom, useSetAtom } from "jotai";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui";

import { SectionBlock } from "../section";

function ThemeBlock() {
    const [theme] = useAtom(themeAtom);
    const setTheme = useSetAtom(setThemeAtom);

    return (
        <SectionBlock className="flex-row items-center justify-between gap-3">
            <h2 className="font-bold text-lg">
                <Trans>Theme</Trans>
            </h2>
            <ToggleGroup
                type="single"
                value={theme}
                variant="outline"
                size="lg"
                onValueChange={(value) => {
                    if (value === "") return;
                    setTheme(value as Theme);
                }}
                className="w-full max-w-[200px]"
            >
                <ToggleGroupItem value={Theme.AUTO} aria-label="Toggle auto mode" className="cursor-pointer">
                    <Trans>Auto</Trans>
                </ToggleGroupItem>
                <ToggleGroupItem value={Theme.LIGHT} aria-label="Toggle light mode" className="cursor-pointer">
                    <Trans>Light</Trans>
                </ToggleGroupItem>
                <ToggleGroupItem value={Theme.DARK} aria-label="Toggle dark mode" className="cursor-pointer">
                    <Trans>Dark</Trans>
                </ToggleGroupItem>
            </ToggleGroup>
        </SectionBlock>
    );
}

export { ThemeBlock };
