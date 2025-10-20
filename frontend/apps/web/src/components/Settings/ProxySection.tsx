import { Section, SectionBlock, SectionBody } from "@lavascope/ui/components/lavascope/settings/section";
import { Input } from "@lavascope/ui/components/ui/input";
import { useLingui } from "@lingui/react/macro";
import { useAtom, useAtomValue } from "jotai";

import { Platform, platformAtom } from "@/store/environment";
import { proxyAddressAtom } from "@/store/proxy";

export default function ProxySection() {
    const platform = useAtomValue(platformAtom);
    if (platform === Platform.WEB) return null;

    const [proxyAddress, setProxyAddress] = useAtom(proxyAddressAtom);

    const { t } = useLingui();

    return (
        <Section header={t`Proxy`}>
            <SectionBody>
                <SectionBlock>
                    <Input
                        type="text"
                        label={t`Address`}
                        placeholder={t`Enter http proxy address`}
                        value={proxyAddress}
                        onChange={(e) => setProxyAddress(e.target.value)}
                        classNames={{
                            input: "!text-default-500 focus:!text-foreground transition-colors-opacity",
                            inputWrapper: "px-4",
                        }}
                    />
                </SectionBlock>
            </SectionBody>
        </Section>
    );
}
