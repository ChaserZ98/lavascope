import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Divider,
    Input,
} from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";

import { Environment, environmentAtom } from "@/store/environment";
import { screenSizeAtom } from "@/store/screen";
import { setSettingsAtom, type Settings, settingsAtom } from "@/store/settings";

export const Route = createFileRoute("/settings")({
    component: Settings,
});

function Settings() {
    const environment = useAtomValue(environmentAtom);

    const screenSize = useAtomValue(screenSizeAtom);

    const settings = useAtomValue(settingsAtom);
    const setSettings = useSetAtom(setSettingsAtom);

    const [tempSettings, setTempSettings] = useState<Settings>({
        ...settings,
    });

    useEffect(() => {
        setTempSettings({ ...settings });
    }, [settings]);

    const isChanged = useCallback(() => {
        if (tempSettings.apiToken !== settings.apiToken) return false;
        if (tempSettings.proxyAddress !== settings.proxyAddress) return false;
        return true;
    }, [tempSettings, settings]);

    return (
        <div className="flex px-2 justify-center select-none">
            <Card className="mt-2 w-full max-w-sm [transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity]">
                <CardHeader>
                    <div className="w-full text-center">
                        <h1 className="text-foreground text-lg sm:text-2xl transition-colors-opacity">
                            Settings
                        </h1>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody>
                    <div className="flex flex-col gap-2 max-w-[400px] w-full">
                        <h2 className="text-base text-foreground transition-colors-opacity sm:text-lg">
                            Secrets
                        </h2>
                        <Input
                            type="password"
                            label="API Token"
                            size={screenSize === "sm" ? "sm" : "md"}
                            placeholder="Enter token here"
                            value={tempSettings.apiToken}
                            onChange={(e) =>
                                setTempSettings({
                                    ...tempSettings,
                                    apiToken: e.target.value,
                                })
                            }
                            classNames={{
                                input: "!text-default-500 focus:!text-foreground transition-colors-opacity",
                            }}
                        />
                        {environment !== Environment.WEB && (
                            <>
                                <Divider />
                                <h2 className="text-base text-foreground transition-colors-opacity sm:text-lg">
                                    Proxy
                                </h2>
                                <Input
                                    type="text"
                                    label="Address"
                                    size={screenSize === "sm" ? "sm" : "md"}
                                    placeholder="Enter http proxy address"
                                    value={tempSettings.proxyAddress}
                                    onChange={(e) =>
                                        setTempSettings({
                                            ...tempSettings,
                                            proxyAddress: e.target.value,
                                        })
                                    }
                                    classNames={{
                                        input: "!text-default-500 focus:!text-foreground transition-colors-opacity",
                                    }}
                                />
                            </>
                        )}
                    </div>
                </CardBody>
                <Divider />
                <CardFooter className="flex justify-end">
                    <Button
                        color="primary"
                        size={screenSize === "sm" ? "sm" : "md"}
                        isDisabled={isChanged()}
                        onPress={() => {
                            setSettings({ ...tempSettings });
                        }}
                    >
                        Apply
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
