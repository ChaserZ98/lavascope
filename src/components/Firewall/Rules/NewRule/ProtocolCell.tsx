import { Select, SelectItem, SelectSection } from "@heroui/react";

import { NewRuleState, Protocol, ProtocolSelection } from "@/store/firewall";

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

export default function ProtocolCell({
    isDisabled,
    newRule,
    onRuleChange,
}: {
    isDisabled?: boolean;
    newRule: NewRuleState;
    onRuleChange: (rule: NewRuleState) => void;
}) {
    const protocolSelection = newRule.protocol;
    return (
        <Select
            items={protocols}
            isDisabled={isDisabled || newRule.creating}
            variant="faded"
            selectionMode="single"
            placeholder="SSH"
            aria-label="Protocol"
            selectedKeys={new Set([protocolSelection])}
            onSelectionChange={(keys) => {
                const protocol =
                    (keys.currentKey as ProtocolSelection) || protocolSelection;
                const port = getProtocolPort(protocol);
                onRuleChange({
                    ...newRule,
                    port,
                    protocol,
                });
            }}
            classNames={{
                base: "min-w-[150px] !duration-250",
                trigger: "transition-colors-opacity",
                value: "transition-colors-opacity",
                selectorIcon: "text-foreground transition-colors-opacity",
            }}
        >
            {(type) => (
                <SelectSection title={type.title} showDivider key={type.title}>
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
    );
}
