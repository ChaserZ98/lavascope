import { Select, SelectItem } from "@heroui/react";
import { ipv4Atom, ipv6Atom, IPVersion } from "@lavascope/store";
import { useLingui } from "@lingui/react/macro";
import { useParams } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";

import { type NewRuleState, setNewRuleAtom, SourceType } from "@/store/firewall";

export function getSource(
    sourceType: SourceType,
    ipVersion: IPVersion,
    ipv4: string,
    ipv6: string
): string {
    switch (sourceType) {
        case SourceType.MY_IP:
            return ipVersion === IPVersion.V4 ? ipv4 : ipv6;
        case SourceType.CLOUDFLARE:
            return "cloudflare";
        case SourceType.CUSTOM:
            return "";
        case SourceType.ANYWHERE:
            return ipVersion === IPVersion.V4 ? "0.0.0.0/0" : "::/0";
        case SourceType.LOAD_BALANCER:
            return "load_balancer";
    }
}

export default function SourceTypeCell({
    isDisabled,
    newRule,
}: {
    isDisabled?: boolean;
    newRule: NewRuleState;
}) {
    const { id: groupId = "" } = useParams({
        from: "/_app/groups/$id",
    });

    const myIPv4 = useAtomValue(ipv4Atom);
    const myIPv6 = useAtomValue(ipv6Atom);

    const setNewRule = useSetAtom(setNewRuleAtom);

    const { t } = useLingui();

    const sourceTypes = [
        {
            title: t`My IP`,
            value: SourceType.MY_IP,
        },
        {
            title: t`Cloudflare`,
            value: SourceType.CLOUDFLARE,
        },
        {
            title: t`Custom`,
            value: SourceType.CUSTOM,
        },
        {
            title: t`Anywhere`,
            value: SourceType.ANYWHERE,
        },
        {
            // TODO: Implement load balancer source type
            title: t`Load Balancer (WIP)`,
            value: SourceType.LOAD_BALANCER,
        },
    ];

    return (
        <Select
            isDisabled={isDisabled}
            disallowEmptySelection
            items={
                (newRule.ip_type === IPVersion.V4 && myIPv4.value) ||
                (newRule.ip_type === IPVersion.V6 && myIPv6.value) ?
                    sourceTypes :
                    sourceTypes.filter(
                        (type) => type.value !== SourceType.MY_IP
                    )
            }
            disabledKeys={[SourceType.LOAD_BALANCER]}
            variant="faded"
            selectionMode="single"
            placeholder="Source Type"
            aria-label="Source Type"
            selectedKeys={new Set([newRule.sourceType])}
            onSelectionChange={(keys) => {
                const sourceType = keys.currentKey as SourceType;
                const source = getSource(
                    sourceType,
                    newRule.ip_type,
                    myIPv4.value,
                    myIPv6.value
                );
                setNewRule(groupId, {
                    ...newRule,
                    sourceType,
                    source,
                });
            }}
            classNames={{
                base: "min-w-[130px] !duration-250",
                trigger: "transition-colors-opacity",
                value: "transition-colors-opacity",
                selectorIcon: "text-foreground transition-colors-opacity",
            }}
        >
            {(type) => (
                <SelectItem key={type.value} textValue={type.title}>
                    <span className="text-sm">{type.title}</span>
                </SelectItem>
            )}
        </Select>
    );
}
