import { useLingui } from "@lingui/react/macro";

import { Section, SectionBody } from "../Section";
import AutoStartBlock from "./AutoStartBlock";
import LanguageBlock from "./Language";

export default function GeneralSection() {
    const { t } = useLingui();

    return (
        <Section header={t`General`}>
            <SectionBody>
                <LanguageBlock />
                <AutoStartBlock />
            </SectionBody>
        </Section>
    );
}
