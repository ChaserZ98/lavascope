import { ColorScheme, colorSchemeAtom, setColorSchemeWithAnimationAtom } from "@lavascope/store";
import { Trans } from "@lingui/react/macro";
import { useAtomValue, useSetAtom } from "jotai";

import { ToggleGroup, ToggleGroupItem } from "#components/ui";

import { SectionBlock } from "../section";

function ColorSchemeBlock() {
    const theme = useAtomValue(colorSchemeAtom);
    const setThemeWithAnimate = useSetAtom(setColorSchemeWithAnimationAtom);

    return (
        <SectionBlock className="flex-row items-center justify-between gap-3">
            <h2 className="font-bold text-lg">
                <Trans>Color Mode</Trans>
            </h2>
            <ToggleGroup
                type="single"
                value={theme}
                variant="outline"
                size="lg"
                onValueChange={(value) => {
                    if (value === "") return;
                    setThemeWithAnimate(value as ColorScheme, 500);
                }}
                className="w-full max-w-[200px]"
            >
                <ToggleGroupItem value={ColorScheme.AUTO} aria-label="Toggle auto mode" className="cursor-pointer">
                    <Trans>Auto</Trans>
                </ToggleGroupItem>
                <ToggleGroupItem value={ColorScheme.LIGHT} aria-label="Toggle light mode" className="cursor-pointer">
                    <Trans>Light</Trans>
                </ToggleGroupItem>
                <ToggleGroupItem value={ColorScheme.DARK} aria-label="Toggle dark mode" className="cursor-pointer">
                    <Trans>Dark</Trans>
                </ToggleGroupItem>
            </ToggleGroup>
        </SectionBlock>
    );
}

export { ColorSchemeBlock };
