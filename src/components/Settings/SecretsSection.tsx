import { Input } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { useAtom, useAtomValue } from "jotai";

import { apiTokenAtom } from "@/store/firewall/firewall";
import { screenSizeAtom } from "@/store/screen";

import { Section, SectionBody } from "./Section";

export default function SecretsSection() {
    const screenSize = useAtomValue(screenSizeAtom);

    const [apiToken, setApiToken] = useAtom(apiTokenAtom);

    const { t } = useLingui();

    return (
        <Section header={t`Secrets`}>
            <SectionBody>
                <Input
                    type="password"
                    label={t`API Token`}
                    size={screenSize === "sm" ? "sm" : "md"}
                    placeholder={t`Enter token here`}
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    classNames={{
                        input: "!text-default-500 focus:!text-foreground transition-colors-opacity",
                        inputWrapper: "px-4",
                    }}
                />
            </SectionBody>
        </Section>
    );
}
