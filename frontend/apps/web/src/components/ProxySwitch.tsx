import { Platform, platformAtom } from "@lavascope/store";
import { Label, Switch } from "@lavascope/ui/components/ui";
import { Trans } from "@lingui/react/macro";
import { useAtom, useAtomValue } from "jotai";

import { useProxyAtom } from "@/store/proxy";

export default function ProxySwitch() {
    const platform = useAtomValue(platformAtom);
    if (platform === Platform.WEB) return null;

    const [useProxy, setUseProxy] = useAtom(useProxyAtom);

    return (
        <div
            className="flex items-center space-x-2 p-2 rounded-lg bg-card text-card-foreground cursor-pointer hover:bg-accent hover:text-accent-foreground"
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
