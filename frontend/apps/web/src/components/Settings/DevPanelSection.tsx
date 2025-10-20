import { Section, SectionBlock, SectionBody } from "@lavascope/ui/components/lavascope/settings/section";
import { Switch } from "@lavascope/ui/components/ui";
import { useLingui } from "@lingui/react/macro";
import { useAtom } from "jotai";

import { showDevPanelAtom } from "@/store/settings";

export default function DevPanelSection() {
    const isDevMode = !import.meta.env.PROD;
    if (!isDevMode) return null;

    const [showDevPanel, setShowDevPanel] = useAtom(showDevPanelAtom);

    const { t } = useLingui();

    return (
        <Section header={t`Dev Panel`}>
            <SectionBody>
                <SectionBlock className="flex flex-row justify-between">
                    <h2 className="font-bold text-lg">
                        Jotai
                    </h2>
                    <Switch
                        checked={showDevPanel.jotai}
                        onCheckedChange={(value) =>
                            setShowDevPanel((state) => {
                                state.jotai = value;
                            })}
                    >
                        Jotai
                    </Switch>
                </SectionBlock>
                <SectionBlock className="justify-between">
                    <h2 className="font-bold text-lg">
                        Tanstack Router
                    </h2>
                    <Switch
                        checked={showDevPanel.tanStack}
                        onCheckedChange={(value) =>
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
