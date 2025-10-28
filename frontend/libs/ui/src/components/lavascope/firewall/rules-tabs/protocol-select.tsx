import { VultrFirewall } from "@lavascope/store/firewlall";
import type { ComponentProps } from "react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, Separator } from "#components/ui";

function getProtocolPort(protocol: VultrFirewall.ProtocolSelection): string {
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

const protocols = [
    {
        label: "Protocols",
        items: [
            {
                title: "ICMP",
                description: "Internet Control Message Protocol",
                value: VultrFirewall.Protocol.ICMP,
            },
            {
                title: "TCP",
                description: "Transmission Control Protocol",
                value: VultrFirewall.Protocol.TCP,
            },
            {
                title: "UDP",
                description: "User Datagram Protocol",
                value: VultrFirewall.Protocol.UDP,
            },
            {
                title: "GRE",
                description: "Generic Routing Encapsulation",
                value: VultrFirewall.Protocol.GRE,
            },
            {
                title: "ESP",
                description: "Encapsulating Security Payload",
                value: VultrFirewall.Protocol.ESP,
            },
            {
                title: "AH",
                description: "Authentication Header",
                value: VultrFirewall.Protocol.AH,
            },
        ],
    },
    {
        label: "Common Applications",
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

function ProtocolSelect({
    newRule,
    ...props
}: {
    newRule: VultrFirewall.NewRuleState;
} & ComponentProps<typeof Select>) {
    const protocolSelection = newRule.protocol;

    return (
        <Select {...props}>
            <SelectTrigger className="cursor-pointer">
                <p className="uppercase">{protocolSelection}</p>
            </SelectTrigger>
            <SelectContent>
                {
                    protocols.map((group, index) => (
                        <SelectGroup key={index}>
                            <SelectLabel>{group.label}</SelectLabel>
                            {
                                group.items.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>{item.title}</SelectItem>
                                ))
                            }
                            <Separator orientation="horizontal" className="bg-muted-foreground" />
                        </SelectGroup>
                    ))
                }
            </SelectContent>
        </Select>
    );
}

export { getProtocolPort, ProtocolSelect };
