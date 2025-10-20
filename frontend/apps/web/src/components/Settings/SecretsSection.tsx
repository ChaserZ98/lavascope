import { apiTokenAtom } from "@lavascope/store";
import { Section, SectionBlock, SectionBody } from "@lavascope/ui/components/lavascope/settings/section";
import { Input } from "@lavascope/ui/components/ui";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react/macro";
import { useAtom } from "jotai";

export default function SecretsSection() {
    const [apiToken, setApiToken] = useAtom(apiTokenAtom);

    const { t } = useLingui();

    return (
        <Section header={t`Secrets`}>
            <SectionBody>
                <SectionBlock className="justify-between">
                    <h2 className="font-bold text-lg">
                        <Trans>
                            API Token
                        </Trans>
                    </h2>
                    <Input
                        type="password"
                        placeholder={t`Enter token here`}
                        value={apiToken}
                        onChange={(e) => setApiToken(e.target.value)}
                        className="w-full max-w-[200px]"
                    />
                </SectionBlock>
            </SectionBody>
        </Section>
    );
}
