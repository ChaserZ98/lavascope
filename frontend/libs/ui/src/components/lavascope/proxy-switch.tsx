import { Platform, platformAtom, useProxyAtom } from "@lavascope/store";
import { Label, Switch } from "@lavascope/ui/components/ui";
import { Trans } from "@lingui/react/macro";
import { useAtom, useAtomValue } from "jotai";
import type { ComponentProps } from "react";

import { cn } from "#lib/utils";

function ProxySwitch({ className }: ComponentProps<"div">) {
    const platform = useAtomValue(platformAtom);
    if (platform === Platform.WEB) return null;

    const [useProxy, setUseProxy] = useAtom(useProxyAtom);

    const divClassName = cn(
        "flex items-center space-x-2 p-2 rounded-lg bg-card text-card-foreground cursor-pointer hover:bg-accent hover:text-accent-foreground",
        className
    );

    return (
        <div
            className={divClassName}
            onClick={() => setUseProxy(!useProxy)}
        >
            <Label htmlFor="proxy-switch" className="pointer-events-none">
                <Trans>Proxy</Trans>
            </Label>
            <Switch
                id="proxy-switch"
                checked={useProxy}
                className="pointer-events-none"
            >
                <Trans>Proxy</Trans>
            </Switch>
        </div>

    );
}

export { ProxySwitch };
