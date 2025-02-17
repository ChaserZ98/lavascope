import {
    Button,
    Input,
    Select,
    SelectItem,
    SelectSection,
    TableCell,
    TableRow,
    Textarea,
    Tooltip,
} from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { useAtomValue } from "jotai";

import {
    NewRuleState,
    Protocol,
    ProtocolSelection,
    SourceType,
} from "@/store/firewall/rules";
import { ipv4Atom, ipv6Atom, Version as IPVersion } from "@/store/ip";

export const protocols = [
    {
        title: "Protocols",
        items: [
            {
                title: "ICMP",
                description: "Internet Control Message Protocol",
                value: Protocol.ICMP,
            },
            {
                title: "TCP",
                description: "Transmission Control Protocol",
                value: Protocol.TCP,
            },
            {
                title: "UDP",
                description: "User Datagram Protocol",
                value: Protocol.UDP,
            },
            {
                title: "GRE",
                description: "Generic Routing Encapsulation",
                value: Protocol.GRE,
            },
            {
                title: "ESP",
                description: "Encapsulating Security Payload",
                value: Protocol.ESP,
            },
            {
                title: "AH",
                description: "Authentication Header",
                value: Protocol.AH,
            },
        ],
    },
    {
        title: "Common Applications",
        items: [
            {
                title: "SSH",
                description: "Secure Shell",
                value: "ssh",
            },
            {
                title: "HTTP",
                description: "HyperText Transfer Protocol",
                value: "http",
            },
            {
                title: "HTTPS",
                description: "HyperText Transfer Protocol Secure",
                value: "https",
            },
            {
                title: "HTTP3",
                description: "HyperText Transfer Protocol Version 3",
                value: "http3",
            },
            {
                title: "MySQL",
                description: "MySQL Database Server",
                value: "mysql",
            },
            {
                title: "PostgreSQL",
                description: "PostgreSQL Database Server",
                value: "postgresql",
            },
            {
                title: "DNS (UDP)",
                description: "Domain Name System (UDP)",
                value: "dns-udp",
            },
            {
                title: "DNS (TCP)",
                description: "Domain Name System (TCP)",
                value: "dns-tcp",
            },
            {
                title: "MS RDP",
                description: "Microsoft Remote Desktop Protocol",
                value: "ms-rdp",
            },
        ],
    },
];

export function getProtocolPort(protocol: ProtocolSelection): string {
    switch (protocol) {
        case "ssh":
            return "22";
        case "http":
            return "80";
        case "https":
            return "443";
        case "http3":
            return "443";
        case "mysql":
            return "3306";
        case "postgresql":
            return "5432";
        case "dns-udp":
            return "53";
        case "dns-tcp":
            return "53";
        case "ms-rdp":
            return "3389";
        default:
            return "";
    }
}

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

type NewRuleProps = {
    ipVersion: IPVersion;
    newRule: NewRuleState;
    onRuleChange: (rule: NewRuleState) => void;
    onRuleCreate: (rule: NewRuleState) => void;
    isLoading?: boolean;
};

export default function NewRule(props: NewRuleProps) {
    const myIPv4 = useAtomValue(ipv4Atom);
    const myIPv6 = useAtomValue(ipv6Atom);

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
            title: t`Load Balancer`,
            value: SourceType.LOAD_BALANCER,
        },
    ];

    return (
        <TableRow>
            <TableCell>
                <Select
                    items={protocols}
                    isDisabled={props.isLoading}
                    variant="faded"
                    selectionMode="single"
                    placeholder="SSH"
                    aria-label="Protocol"
                    selectedKeys={new Set([props.newRule.protocol])}
                    onSelectionChange={(keys) => {
                        const protocol =
                            (keys.currentKey as ProtocolSelection) ||
                            props.newRule.protocol;
                        const port =
                            getProtocolPort(protocol) ||
                            (protocol === Protocol.TCP ||
                            protocol === Protocol.UDP
                                ? props.newRule.port
                                : "");
                        props.onRuleChange({
                            ...props.newRule,
                            port,
                            protocol,
                        });
                    }}
                    classNames={{
                        base: "min-w-[150px] !duration-250",
                        trigger: "transition-colors-opacity",
                        value: "transition-colors-opacity",
                        selectorIcon:
                            "text-foreground transition-colors-opacity",
                    }}
                >
                    {(type) => (
                        <SelectSection
                            title={type.title}
                            showDivider
                            key={type.title}
                        >
                            {type.items.map((protocol) => (
                                <SelectItem
                                    key={protocol.value}
                                    textValue={protocol.title}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm">
                                            {protocol.title}
                                        </span>
                                        <span className="text-xs text-default-400 text-wrap">
                                            {protocol.description}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectSection>
                    )}
                </Select>
            </TableCell>
            <TableCell>
                <Input
                    placeholder="Port"
                    aria-label="Port"
                    variant="faded"
                    isDisabled={
                        (props.newRule.protocol !== Protocol.TCP &&
                            props.newRule.protocol !== Protocol.UDP) ||
                        props.newRule.creating
                    }
                    value={props.newRule.port}
                    onChange={(e) =>
                        e.target.value.match(/^[0-9]{0,5}$/)
                            ? props.onRuleChange({
                                  ...props.newRule,
                                  port: e.target.value,
                              })
                            : e.preventDefault()
                    }
                    classNames={{
                        base: "min-w-[80px]",
                        inputWrapper: "transition-colors-opacity !duration-250",
                        input: "text-foreground transition-colors-opacity",
                    }}
                />
            </TableCell>
            <TableCell>
                <Select
                    isDisabled={props.newRule.creating}
                    disallowEmptySelection
                    items={
                        (props.newRule.ip_type === IPVersion.V4 &&
                            myIPv4.value) ||
                        (props.newRule.ip_type === IPVersion.V6 && myIPv6.value)
                            ? sourceTypes
                            : sourceTypes.filter(
                                  (type) => type.value !== SourceType.MY_IP
                              )
                    }
                    variant="faded"
                    selectionMode="single"
                    placeholder="Source Type"
                    aria-label="Source Type"
                    selectedKeys={new Set([props.newRule.sourceType])}
                    onSelectionChange={(keys) => {
                        const sourceType = keys.currentKey as SourceType;
                        const source = getSource(
                            sourceType,
                            props.ipVersion,
                            myIPv4.value,
                            myIPv6.value
                        );
                        props.onRuleChange({
                            ...props.newRule,
                            sourceType,
                            source,
                        });
                    }}
                    classNames={{
                        base: "min-w-[130px] !duration-250",
                        trigger: "transition-colors-opacity",
                        value: "transition-colors-opacity",
                        selectorIcon:
                            "text-foreground transition-colors-opacity",
                    }}
                >
                    {(type) => (
                        <SelectItem key={type.value} textValue={type.title}>
                            <span className="text-sm">{type.title}</span>
                        </SelectItem>
                    )}
                </Select>
            </TableCell>
            <TableCell>
                <Textarea
                    isDisabled={
                        props.newRule.sourceType !== SourceType.CUSTOM ||
                        props.newRule.creating
                    }
                    minRows={1}
                    maxRows={4}
                    variant="faded"
                    placeholder={
                        props.ipVersion === IPVersion.V4
                            ? "x.x.x.x/xx"
                            : "x:x:x:x:x:x:x:x/xxx"
                    }
                    value={props.newRule.source}
                    classNames={{
                        base: "min-w-[150px]",
                        inputWrapper:
                            "px-2 transition-colors-opacity !duration-250",
                        innerWrapper: "h-full",
                        input: "resize-none h-5 text-foreground !ease-[ease] !duration-250 !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity] placeholder:transition-colors-opacity placeholder:italic",
                    }}
                    onChange={(e) => {
                        props.onRuleChange({
                            ...props.newRule,
                            source: e.target.value,
                        });
                    }}
                />
            </TableCell>
            <TableCell>
                <Textarea
                    isDisabled={props.isLoading}
                    minRows={1}
                    variant="faded"
                    placeholder={t`Enter note here`}
                    value={props.newRule.notes}
                    classNames={{
                        base: "min-w-[120px]",
                        inputWrapper:
                            "px-2 transition-colors-opacity !duration-250",
                        innerWrapper: "h-full",
                        input: "resize-none overflow-y-auto h-5 text-balance text-foreground !ease-[ease] !duration-250 !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity] placeholder:transition-colors-opacity placeholder:italic",
                    }}
                    onChange={(e) =>
                        props.onRuleChange({
                            ...props.newRule,
                            notes: e.target.value,
                        })
                    }
                />
            </TableCell>
            <TableCell>
                <div className="flex w-full h-full items-center justify-center py-1">
                    <Tooltip
                        delay={500}
                        closeDelay={150}
                        content={t`Add Rule`}
                        size="sm"
                        color="primary"
                    >
                        <Button
                            isDisabled={props.newRule.creating}
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="primary"
                            className="text-default-400 transition-colors-opacity hover:text-primary-400"
                            onPress={() => {
                                props.onRuleCreate(props.newRule);
                            }}
                            isLoading={props.newRule.creating}
                        >
                            <Icon path={mdiPlus} size={0.75} />
                        </Button>
                    </Tooltip>
                </div>
            </TableCell>
        </TableRow>
    );
}
