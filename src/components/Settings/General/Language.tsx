import { Select, SelectItem } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { useAtom, useAtomValue } from "jotai";
import { useCallback } from "react";

import { Platform, platformAtom } from "@/store/environment";
import { languageAtom } from "@/store/language";
import { dynamicActivate, Locale, toLocalString } from "@/utils/i18n";

import { SectionBlock } from "../Section";

export default function LanguageBlock() {
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

    const { t } = useLingui();

    return (
        <SectionBlock>
            <Select
                selectionMode="single"
                disallowEmptySelection
                label={t`language`}
                selectedKeys={new Set([language])}
                onSelectionChange={(keys) =>
                    handleLanguageChange(keys.currentKey as Locale, platform)}
                classNames={{
                    trigger: "px-4 rounded-none transition-colors-opacity",
                    value: "transition-colors-opacity",
                    popoverContent: "transition-colors-opacity",
                }}
            >
                {Object.values(Locale).map((locale) => (
                    <SelectItem key={locale}>
                        {toLocalString(locale)}
                    </SelectItem>
                ))}
            </Select>
        </SectionBlock>
    );
}
