import { DevPanelSection } from "@lavascope/ui/components/lavascope/settings/dev-panel";
import { GeneralSection } from "@lavascope/ui/components/lavascope/settings/general/general-section";
import { ProxySection } from "@lavascope/ui/components/lavascope/settings/proxy";
import { SecretsSection } from "@lavascope/ui/components/lavascope/settings/secrets";
import { Card, CardContent, CardFooter } from "@lavascope/ui/components/ui";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/settings")({
    component: Settings,
});

function Settings() {
    return (
        <div className="flex px-2 justify-center select-none">
            <Card className="mt-2 w-full [transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity]">
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
