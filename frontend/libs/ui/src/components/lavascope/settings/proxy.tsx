import { Platform, platformAtom } from "@lavascope/store";
import { proxyAddressAtom } from "@lavascope/store";
import { Trans, useLingui } from "@lingui/react/macro";
import { useAtom, useAtomValue } from "jotai";

import { Section, SectionBlock, SectionBody } from "#components/lavascope/settings/section";
import { Input, Label } from "#components/ui";

function ProxySection() {
    const platform = useAtomValue(platformAtom);
    if (platform === Platform.WEB) return null;

    const [proxyAddress, setProxyAddress] = useAtom(proxyAddressAtom);

    const { t } = useLingui();

    return (
        <Section header={t`Proxy`}>
            <SectionBody>
                <SectionBlock className="justify-between">
                    <Label className="font-bold text-lg">
                        <Trans>
                            Address
                        </Trans>
                    </Label>
                    <Input
                        type="text"
                        placeholder={t`Enter http proxy address`}
                        value={proxyAddress}
                        onChange={(e) => setProxyAddress(e.target.value)}
                        className="w-full max-w-[200px]"
                    />
                </SectionBlock>
            </SectionBody>
        </Section>
    );
}

export { ProxySection };
