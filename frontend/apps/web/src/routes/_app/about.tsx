import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@lavascope/ui/components/ui";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/about")({
    component: About,
});

function About() {
    return (
        <Card className="flex w-full">
            <CardHeader className="">
                <CardTitle className="flex items-center">
                    <div>
                        <img src="/favicon.ico" className="h-16" />
                    </div>
                    <div className="h-full">
                        <h1 className="font-bold text-2xl">
                            <Trans>LavaScope</Trans>
                        </h1>
                        <p>{__BUILD_INFO__.tauri_config_version}</p>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Trans>Version</Trans>
                </div>
            </CardContent>
            <CardFooter>
                <Trans>
                    Copyright © 2025 Feiyu Zheng. All rights reserved.
                </Trans>
            </CardFooter>
        </Card>
    );
}
