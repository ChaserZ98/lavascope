import { GeneralSection } from "@lavascope/ui/components/lavascope/settings/general-section";
import { Card, CardContent, CardFooter } from "@lavascope/ui/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

import DevPanelSection from "@/components/Settings/DevPanelSection";
import ProxySection from "@/components/Settings/ProxySection";
import SecretsSection from "@/components/Settings/SecretsSection";

export const Route = createFileRoute("/_app/settings")({
    component: Settings,
});

function Settings() {
    return (
        <div className="flex px-2 justify-center select-none">
            <Card className="mt-2 w-full [transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity]">
                {/* <CardHeader className="text-foreground text-lg sm:text-2xl">
                    <h1>
                        <Trans>General</Trans>
                    </h1>
                </CardHeader> */}
                {/* <Separator /> */}
                {/* <Divider /> */}
                <CardContent className="space-y-4">
                    <GeneralSection />
                    <DevPanelSection />
                    <SecretsSection />
                    <ProxySection />
                </CardContent>
                <CardFooter className="flex justify-end"></CardFooter>
            </Card>
        </div>
    );
}
