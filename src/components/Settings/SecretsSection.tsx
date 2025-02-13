import { Input } from "@heroui/react";
import { useAtom, useAtomValue } from "jotai";

import { screenSizeAtom } from "@/store/screen";
import { apiTokenAtom } from "@/store/settings";

import { Section, SectionBody } from "./Section";

export default function SecretsSection() {
    const screenSize = useAtomValue(screenSizeAtom);

    const [apiToken, setApiToken] = useAtom(apiTokenAtom);

    return (
        <Section header="Secrets">
            <SectionBody>
                <Input
                    type="password"
                    label="API Token"
                    size={screenSize === "sm" ? "sm" : "md"}
                    placeholder="Enter token here"
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
