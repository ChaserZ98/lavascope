import { VultrFirewall } from "@lavascope/store/firewlall";
import { Input } from "@lavascope/ui/components/ui";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react/macro";
import { useAtom } from "jotai";

import { Section, SectionBlock, SectionBody } from "./section";

function SecretsSection() {
    const [apiToken, setApiToken] = useAtom(VultrFirewall.apiTokenAtom);

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

export { SecretsSection };
