import { Switch } from "@heroui/react";
import { useAtomValue, useSetAtom } from "jotai";

import { setSettingsAtom, settingsAtom } from "@/store/settings";

export default function ProxySwitch() {
    const settings = useAtomValue(settingsAtom);
    const setSettings = useSetAtom(setSettingsAtom);

    return (
        <Switch
            isSelected={settings.useProxy}
            onValueChange={() => {
                setSettings({ ...settings, useProxy: !settings.useProxy });
            }}
            classNames={{
                base: "min-w-32",
                label: "text-foreground transition-colors-opacity",
            }}
        >
            {`Proxy ${settings.useProxy ? "On" : "Off"}`}
        </Switch>
    );
}
