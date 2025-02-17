import { Select, SelectItem } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { useAtomValue, useSetAtom } from "jotai";

import { changeLanguageAtom, languageAtom } from "@/store/language";
import { Locales, toLocalString } from "@/utils/i18n";

export default function LanguageBlock() {
    const language = useAtomValue(languageAtom);

    const changeLanguage = useSetAtom(changeLanguageAtom);

    const { t } = useLingui();

    return (
        <Select
            selectionMode="single"
            disallowEmptySelection
            label={t`language`}
            selectedKeys={new Set([language])}
            onSelectionChange={(keys) => {
                changeLanguage(keys.currentKey as Locales);
            }}
            classNames={{
                trigger: "px-4 transition-colors-opacity",
                value: "transition-colors-opacity",
                popoverContent: "transition-colors-opacity",
            }}
        >
            {Object.values(Locales).map((locale) => (
                <SelectItem key={locale}>{toLocalString(locale)}</SelectItem>
            ))}
        </Select>
    );
}
