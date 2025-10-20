import { dynamicActivate, toLocalString } from "@lavascope/i18n";
import { languageAtom, Locale, Platform, platformAtom } from "@lavascope/store";
import { SectionBlock } from "@lavascope/ui/components/lavascope/settings/section";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "@lavascope/ui/components/ui";
import { Trans } from "@lingui/react/macro";
import { useAtom, useAtomValue } from "jotai";
import { useCallback } from "react";

function LanguageBlock() {
    const [language, setLanguage] = useAtom(languageAtom);
    const platform = useAtomValue(platformAtom);

    const handleLanguageChange = useCallback(
        async (locale: Locale, platform: Platform) => {
            await dynamicActivate(locale, platform);
            localStorage.setItem("language", locale);
            setLanguage(locale);
        },
        [platform]
    );

    return (
        <SectionBlock className="flex-row justify-between">
            <h2 className="font-bold text-lg">
                <Trans>Language</Trans>
            </h2>
            <Select
                value={language}
                onValueChange={(v) => handleLanguageChange(v as Locale, platform)}
            >
                <SelectTrigger
                    id="language-select"
                    className="w-full max-w-[200px] cursor-pointer"
                >
                    <p className="text-base">{toLocalString(language)}</p>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {Object.values(Locale).map((locale) => (
                            <SelectItem key={locale} value={locale}>
                                {toLocalString(locale)}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </SectionBlock>
    );
}

export { LanguageBlock };
