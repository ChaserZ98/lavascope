import { Input } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { useAtom, useAtomValue } from "jotai";

import { Platform, platformAtom } from "@/store/environment";
import { proxyAddressAtom } from "@/store/proxy";
import { screenSizeAtom } from "@/store/screen";

import { Section, SectionBody } from "./Section";

export default function ProxySection() {
    const platform = useAtomValue(platformAtom);
    if (platform === Platform.WEB) return null;

    const screenSize = useAtomValue(screenSizeAtom);

    const [proxyAddress, setProxyAddress] = useAtom(proxyAddressAtom);

    const { t } = useLingui();

    return (
        <Section header={t`Proxy`}>
            <SectionBody>
                <Input
                    type="text"
                    label={t`Address`}
                    size={screenSize === "sm" ? "sm" : "md"}
                    placeholder={t`Enter http proxy address`}
                    value={proxyAddress}
                    onChange={(e) => setProxyAddress(e.target.value)}
                    classNames={{
                        input: "!text-default-500 focus:!text-foreground transition-colors-opacity",
                        inputWrapper: "px-4",
                    }}
                />
            </SectionBody>
        </Section>
    );
}
