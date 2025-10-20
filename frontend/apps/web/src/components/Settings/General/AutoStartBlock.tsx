import logging from "@lavascope/log";
import { SectionBlock } from "@lavascope/ui/components/lavascope/settings/section";
import { Switch } from "@lavascope/ui/components/ui/switch";
import { Trans } from "@lingui/react/macro";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { atom, useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect } from "react";

import { Platform, platformAtom } from "@/store/environment";

const autoStartAtom = atom(false);

export default function AutoStartBlock() {
    const platform = useAtomValue(platformAtom);
    if ([Platform.WEB, Platform.IOS, Platform.ANDROID].includes(platform))
        return null;

    const [autoStart, setAutoStart] = useAtom(autoStartAtom);

    const handleAutoStart = useCallback(async (value: boolean) => {
        try {
            if (value) await enable();
            else await disable();
            logging.info(`${value ? "Enabled" : "Disabled"} auto-start`);
        } catch (err) {
            logging.error(`Error while toggling auto-start: ${err}`);
        }
        setAutoStart(value);
    }, []);

    useEffect(() => {
        const setInitialAutoStart = async () => {
            try {
                const enabled = await isEnabled();
                setAutoStart(enabled);
            } catch (err) {
                logging.error(
                    `Error while setting initial auto-start value: ${err}`
                );
            }
        };
        setInitialAutoStart();
    }, []);

    return (
        <SectionBlock>
            <Switch
                // classNames={{
                //     base: "group flex flex-row-reverse items-center justify-between py-2 w-full max-w-none bg-content2 transition-colors hover:bg-content3",
                //     hiddenInput: "w-full start-0",
                //     thumb: "ring-inset ring-0 group-hover:ring-1 group-hover:ring-primary",
                //     wrapper: "bg-content3 group-hover:bg-content4 me-4",
                //     label: "ms-4 text-content2-foreground transition-[color] ease-in-out duration-250",
                // }}
                isSelected={autoStart}
                onValueChange={handleAutoStart}
            >
                <Trans>Launch at startup</Trans>
            </Switch>
        </SectionBlock>
    );
}
