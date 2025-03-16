import { Card, CardBody, CardFooter, CardHeader, Divider } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

import DevPanelSection from "@/components/Settings/DevPanelSection";
import GeneralSection from "@/components/Settings/General/GeneralSection";
import ProxySection from "@/components/Settings/ProxySection";
import SecretsSection from "@/components/Settings/SecretsSection";

export const Route = createFileRoute("/_app/settings")({
    component: Settings,
});

function Settings() {
    return (
        <div className="flex px-2 justify-center select-none">
            <Card className="mt-2 w-full max-w-sm [transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity]">
                <CardHeader className="flex justify-center text-foreground text-lg sm:text-2xl transition-colors-opacity">
                    <h1>
                        <Trans>Settings</Trans>
                    </h1>
                </CardHeader>
                <Divider />
                <CardBody>
                    <GeneralSection />
                    <DevPanelSection />
                    <SecretsSection />
                    <ProxySection />
                </CardBody>
                <CardFooter className="flex justify-end"></CardFooter>
            </Card>
        </div>
    );
}
