import logging from "@lavascope/log";
import { Platform, platformAtom, setAutoStartAtom, setInitialAutoStartAtom } from "@lavascope/store";
import { autoStartAtom } from "@lavascope/store";
import { Trans } from "@lingui/react/macro";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";

import { SectionBlock } from "#components/lavascope/settings/section";
import { Switch } from "#components/ui";

function AutoStartBlock() {
    const platform = useAtomValue(platformAtom);

    if ([Platform.WEB, Platform.IOS, Platform.ANDROID].includes(platform))
        return null;

    const autoStart = useAtomValue(autoStartAtom);
    const setAutoStart = useSetAtom(setAutoStartAtom);
    const setInitialAutoStart = useSetAtom(setInitialAutoStartAtom);

    const handleAutoStart = useCallback(async (value: boolean) => {
        try {
            await setAutoStart(value);
            logging.info(`${value ? "Enabled" : "Disabled"} auto-start`);
        } catch (err) {
            logging.error(`Error while toggling auto-start: ${err}`);
        }
    }, []);

    useEffect(() => {
        setInitialAutoStart().catch((err) => {
            logging.error(`Error while setting initial auto-start value: ${err}`);
        });
    }, []);

    return (
        <SectionBlock className="flex-row justify-between">
            <h2 className="font-bold text-lg">
                <Trans>Launch at startup</Trans>
            </h2>
            <Switch
                checked={autoStart}
                onCheckedChange={handleAutoStart}
            >
                <Trans>Launch at startup</Trans>
            </Switch>
        </SectionBlock>
    );
}

export { AutoStartBlock };
