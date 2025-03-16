import { Switch } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { useAtom } from "jotai";

import { showDevPanelAtom } from "@/store/settings";

import { Section, SectionBlock, SectionBody } from "./Section";

export default function DevPanelSection() {
    const isDevMode = !import.meta.env.PROD;
    if (!isDevMode) return null;

    const [showDevPanel, setShowDevPanel] = useAtom(showDevPanelAtom);

    const { t } = useLingui();

    return (
        <Section header={t`Dev Panel`}>
            <SectionBody>
                <SectionBlock>
                    <Switch
                        classNames={{
                            base: "group flex flex-row-reverse items-center justify-between py-2 w-full max-w-none bg-content2 transition-colors hover:bg-content3",
                            hiddenInput: "w-full start-0",
                            thumb: "ring-inset ring-0 group-hover:ring-1 group-hover:ring-primary",
                            wrapper: "bg-content3 group-hover:bg-content4 me-4",
                            label: "ms-4 text-content2-foreground transition-[color] ease-in-out duration-250",
                        }}
                        isSelected={showDevPanel.jotai}
                        onValueChange={(value) =>
                            setShowDevPanel((state) => {
                                state.jotai = value;
                            })}
                    >
                        Jotai
                    </Switch>
                </SectionBlock>
                <SectionBlock>
                    <Switch
                        classNames={{
                            base: "group flex flex-row-reverse items-center justify-between py-2 w-full max-w-none bg-content2 transition-colors hover:bg-content3",
                            hiddenInput: "w-full start-0",
                            thumb: "ring-inset ring-0 group-hover:ring-1 group-hover:ring-primary",
                            wrapper: "me-4 bg-content3 group-hover:bg-content4",
                            label: "ms-4 text-content2-foreground transition-[color] ease-in-out duration-250",
                        }}
                        isSelected={showDevPanel.tanStack}
                        onValueChange={(value) =>
                            setShowDevPanel((state) => {
                                state.tanStack = value;
                            })}
                        color="primary"
                    >
                        TanStack Router
                    </Switch>
                </SectionBlock>
            </SectionBody>
        </Section>
    );
}
