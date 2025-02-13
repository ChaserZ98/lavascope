import { Card, CardBody, CardFooter, CardHeader, Divider } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";

import DevPanelSection from "@/components/Settings/DevPanelSection";
import ProxySection from "@/components/Settings/ProxySection";
import SecretsSection from "@/components/Settings/SecretsSection";

export const Route = createFileRoute("/settings")({
    component: Settings,
});

function Settings() {
    return (
        <div className="flex px-2 justify-center select-none">
            <Card className="mt-2 w-full max-w-sm [transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity]">
                <CardHeader className="flex justify-center text-foreground text-lg sm:text-2xl transition-colors-opacity">
                    <h1>Settings</h1>
                </CardHeader>
                <Divider />
                <CardBody>
                    <DevPanelSection />
                    <SecretsSection />
                    <ProxySection />
                </CardBody>
                <CardFooter className="flex justify-end"></CardFooter>
            </Card>
        </div>
    );
}
