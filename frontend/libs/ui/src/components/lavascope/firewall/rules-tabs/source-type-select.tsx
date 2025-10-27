import { ipv4Atom, ipv6Atom, IPVersion } from "@lavascope/store";
import { VultrFirewall } from "@lavascope/store/firewlall";
import { Trans } from "@lingui/react/macro";
import { useAtomValue } from "jotai";
import type { ComponentProps } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger } from "#components/ui";

function getSource(
    sourceType: VultrFirewall.SourceType,
    ipVersion: IPVersion,
    ipv4: string,
    ipv6: string
): string {
    switch (sourceType) {
        case VultrFirewall.SourceType.MY_IP:
            return ipVersion === IPVersion.V4 ? ipv4 : ipv6;
        case VultrFirewall.SourceType.CLOUDFLARE:
            return "cloudflare";
        case VultrFirewall.SourceType.CUSTOM:
            return "";
        case VultrFirewall.SourceType.ANYWHERE:
            return ipVersion === IPVersion.V4 ? "0.0.0.0/0" : "::/0";
        case VultrFirewall.SourceType.LOAD_BALANCER:
            return "load_balancer";
        default:
            throw new Error(`Invalid source type: ${sourceType}`);
    }
}

function TranslatedSourceType({ value }: { value: VultrFirewall.SourceType }) {
    switch (value) {
        case VultrFirewall.SourceType.MY_IP:
            return <Trans>My IP</Trans>;
        case VultrFirewall.SourceType.CLOUDFLARE:
            return <Trans>Cloudflare</Trans>;
        case VultrFirewall.SourceType.CUSTOM:
            return <Trans>Custom</Trans>;
        case VultrFirewall.SourceType.ANYWHERE:
            return <Trans>Anywhere</Trans>;
        case VultrFirewall.SourceType.LOAD_BALANCER:
            return <Trans>Load Balancer</Trans>;
        default:
            return value;
    }
}

function SourceTypeSelect({
    newRule,
    ...props
}: ComponentProps<typeof Select> & { newRule: VultrFirewall.NewRuleState }) {
    const myIPv4 = useAtomValue(ipv4Atom);
    const myIPv6 = useAtomValue(ipv6Atom);

    const itemsProps: ComponentProps<typeof SelectItem>[] = [
        {
            hidden: (newRule.ip_type === IPVersion.V4 && !myIPv4.value) ||
                (newRule.ip_type === IPVersion.V6 && !myIPv6.value),
            value: VultrFirewall.SourceType.MY_IP,
            children: <Trans>My IP</Trans>
        },
        {
            value: VultrFirewall.SourceType.CLOUDFLARE,
            children: <Trans>Cloudflare</Trans>
        },
        {
            value: VultrFirewall.SourceType.CUSTOM,
            children: <Trans>Custom</Trans>,
        },
        {
            value: VultrFirewall.SourceType.ANYWHERE,
            children: <Trans>Anywhere</Trans>,
        },
        {
            // TODO: Implement load balancer source type
            value: VultrFirewall.SourceType.LOAD_BALANCER,
            children: <Trans>Load Balancer (WIP)</Trans>,
            disabled: true,
        },
    ];

    return (
        <Select
            aria-label="Source Type"
            {...props}
        >
            <SelectTrigger>
                <p><TranslatedSourceType value={newRule.sourceType} /></p>
            </SelectTrigger>
            <SelectContent>
                {
                    itemsProps.map((props, index) => (<SelectItem key={index} {...props} />))
                }
            </SelectContent>
        </Select>
    );
}

export { getSource, SourceTypeSelect };
