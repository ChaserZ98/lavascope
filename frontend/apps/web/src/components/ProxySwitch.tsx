import { Switch } from "@lavascope/ui/components/ui";
import { Trans } from "@lingui/react/macro";
import { useAtom, useAtomValue } from "jotai";

import { Platform, platformAtom } from "@/store/environment";
import { useProxyAtom } from "@/store/proxy";

export default function ProxySwitch() {
    const platform = useAtomValue(platformAtom);
    if (platform === Platform.WEB) return null;

    const [useProxy, setUseProxy] = useAtom(useProxyAtom);

    return (
        <Switch
            checked={useProxy}
            onCheckedChange={() => setUseProxy(!useProxy)}
            // classNames={{
            //     base: "group flex flex-row-reverse items-center justify-between px-1 py-1.5 min-w-[7.5rem] h-full rounded-xl bg-default transition-colors-opacity hover:bg-default-100",
            //     hiddenInput: "w-full start-0",
            //     label: "ms-2 text-foreground transition-colors-opacity",
            //     thumb: "ring-inset ring-0 group-hover:ring-1 group-hover:ring-primary",
            //     wrapper: "me-2 bg-default-600 group-hover:bg-default-700",
            // }}
        >
            <Trans>Proxy</Trans>
        </Switch>
    );
}
