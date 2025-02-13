import { Input } from "@heroui/react";
import { useAtom, useAtomValue } from "jotai";

import { Environment, environmentAtom } from "@/store/environment";
import { screenSizeAtom } from "@/store/screen";
import { proxyAddressAtom } from "@/store/settings";

import { Section, SectionBody } from "./Section";

export default function ProxySection() {
    const environment = useAtomValue(environmentAtom);
    if (environment === Environment.WEB) return null;

    const screenSize = useAtomValue(screenSizeAtom);

    const [proxyAddress, setProxyAddress] = useAtom(proxyAddressAtom);

    return (
        <Section header="Proxy">
            <SectionBody>
                <Input
                    type="text"
                    label="Address"
                    size={screenSize === "sm" ? "sm" : "md"}
                    placeholder="Enter http proxy address"
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
