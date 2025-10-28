import { setThemeWithAnimationAtom, Theme, themeAtom } from "@lavascope/store";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "@lavascope/ui/components/ui";
import { Trans } from "@lingui/react/macro";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import { SectionBlock } from "#components/lavascope/settings/section";

function ThemeBlock() {
    const theme = useAtomValue(themeAtom);
    const setThemeWithAnimation = useSetAtom(setThemeWithAnimationAtom);

    const handleThemeChange = useCallback(
        async (theme: Theme) => {
            setThemeWithAnimation(theme, 500);
        },
        []
    );

    return (
        <SectionBlock className="flex-row justify-between">
            <h2 className="font-bold text-lg">
                <Trans>Theme</Trans>
            </h2>
            <Select
                value={theme}
                onValueChange={(v) => handleThemeChange(v as Theme)}
            >
                <SelectTrigger
                    id="language-select"
                    className="w-full max-w-[200px] cursor-pointer"
                >
                    <p className="text-base">{theme}</p>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {Object.values(Theme).map((theme) => (
                            <SelectItem key={theme} value={theme}>
                                {theme}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </SectionBlock>
    );
}

export { ThemeBlock };
