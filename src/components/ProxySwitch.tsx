import { Switch } from "@heroui/react";

import { useSettingsStore } from "@/zustand/settings";

export default function ProxySwitch() {
    const settings = useSettingsStore((state) => state.settings);
    const setSettings = useSettingsStore((state) => state.setSettings);

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
