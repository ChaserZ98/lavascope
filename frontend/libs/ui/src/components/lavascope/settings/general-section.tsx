import { useLingui } from "@lingui/react/macro";

import { AutoStartBlock } from "./auto-start-block";
import { LanguageBlock } from "./language-block";
import { Section, SectionBody } from "./section";
import { ThemeBlock } from "./theme-block";

function GeneralSection() {
    const { t } = useLingui();

    return (
        <Section
            header={t`General`}
        >
            <SectionBody>
                <LanguageBlock />
                <ThemeBlock />
                <AutoStartBlock />
            </SectionBody>
        </Section>
    );
}

export { GeneralSection };
