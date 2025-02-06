import { Button, Input, Textarea, Tooltip } from "@heroui/react";
import { mdiTrashCan } from "@mdi/js";
import Icon from "@mdi/react";

import {
    portToProtocol,
    RuleInfo,
    RuleState,
    SourceType,
} from "@/zustand/firewall/rules";

type FirewallRuleProps = RuleInfo & {
    loading: boolean;
    onDelete: (rule: RuleState) => void;
};

export default function Rule(props: FirewallRuleProps) {
    return (
        <tr
            className={`group outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 ${
                props.loading ? "animate-pulse" : ""
            }`}
        >
            <td className="py-2 px-3 relative align-top whitespace-normal text-small font-normal [&>*]:z-1 [&>*]:relative outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 before:content-[''] before:absolute before:z-0 before:inset-0 before:opacity-0 data-[selected=true]:before:opacity-100 group-data-[disabled=true]:text-foreground-300 group-data-[disabled=true]:cursor-not-allowed before:bg-default/60 data-[selected=true]:text-default-foreground first:before:rounded-l-lg rtl:first:before:rounded-r-lg rtl:first:before:rounded-l-[unset] last:before:rounded-r-lg rtl:last:before:rounded-l-lg rtl:last:before:rounded-r-[unset] text-start">
                <Input
                    isReadOnly
                    placeholder="Protocol"
                    aria-label="Protocol"
                    variant="faded"
                    value={`${props.protocol.toUpperCase()}${
                        portToProtocol(props.port) === ""
                            ? ""
                            : ` (${portToProtocol(props.port)})`
                    }`}
                    classNames={{
                        base: "min-w-[150px]",
                        inputWrapper: "transition-colors-opacity !duration-250",
                        input: "text-foreground transition-colors-opacity",
                    }}
                />
            </td>
            <td className="py-2 px-3 relative align-top whitespace-normal text-small font-normal [&>*]:z-1 [&>*]:relative outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 before:content-[''] before:absolute before:z-0 before:inset-0 before:opacity-0 data-[selected=true]:before:opacity-100 group-data-[disabled=true]:text-foreground-300 group-data-[disabled=true]:cursor-not-allowed before:bg-default/60 data-[selected=true]:text-default-foreground first:before:rounded-l-lg rtl:first:before:rounded-r-lg rtl:first:before:rounded-l-[unset] last:before:rounded-r-lg rtl:last:before:rounded-l-lg rtl:last:before:rounded-r-[unset] text-start before:transition-colors-opacity">
                <Input
                    isReadOnly
                    placeholder="Port"
                    aria-label="Port"
                    variant="faded"
                    value={props.port || "-"}
                    classNames={{
                        base: "min-w-[80px]",
                        inputWrapper: "transition-colors-opacity !duration-250",
                        input: "text-foreground transition-colors-opacity",
                    }}
                />
            </td>
            <td className="py-2 px-3 relative align-top whitespace-normal text-small font-normal [&>*]:z-1 [&>*]:relative outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 before:content-[''] before:absolute before:z-0 before:inset-0 before:opacity-0 data-[selected=true]:before:opacity-100 group-data-[disabled=true]:text-foreground-300 group-data-[disabled=true]:cursor-not-allowed before:bg-default/60 data-[selected=true]:text-default-foreground first:before:rounded-l-lg rtl:first:before:rounded-r-lg rtl:first:before:rounded-l-[unset] last:before:rounded-r-lg rtl:last:before:rounded-l-lg rtl:last:before:rounded-r-[unset] text-start">
                <Input
                    isReadOnly
                    placeholder="Source Type"
                    aria-label="Source Type"
                    variant="faded"
                    value={
                        props.source ||
                        (props.subnet === "::" || props.subnet === "0.0.0.0"
                            ? "anywhere"
                            : "custom")
                    }
                    classNames={{
                        base: "min-w-[130px]",
                        inputWrapper: "transition-colors-opacity !duration-250",
                        input: "text-foreground transition-colors-opacity capitalize",
                    }}
                />
            </td>
            <td className="py-2 px-3 relative align-top whitespace-normal text-small font-normal [&>*]:z-1 [&>*]:relative outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 before:content-[''] before:absolute before:z-0 before:inset-0 before:opacity-0 data-[selected=true]:before:opacity-100 group-data-[disabled=true]:text-foreground-300 group-data-[disabled=true]:cursor-not-allowed before:bg-default/60 data-[selected=true]:text-default-foreground first:before:rounded-l-lg rtl:first:before:rounded-r-lg rtl:first:before:rounded-l-[unset] last:before:rounded-r-lg rtl:last:before:rounded-l-lg rtl:last:before:rounded-r-[unset] text-start before:transition-colors-opacity">
                <Textarea
                    isReadOnly
                    minRows={1}
                    maxRows={4}
                    variant="faded"
                    placeholder="Source Address"
                    value={
                        props.source === SourceType.CLOUDFLARE
                            ? "cloudflare"
                            : `${props.subnet}/${props.subnet_size}`
                    }
                    classNames={{
                        base: "min-w-[150px]",
                        inputWrapper:
                            "px-2 transition-colors-opacity !duration-250",
                        innerWrapper: "h-full",
                        input: "resize-none h-5 text-foreground !ease-[ease] !duration-250 !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity] placeholder:transition-colors-opacity placeholder:italic",
                    }}
                />
            </td>
            <td className="py-2 px-3 relative align-top whitespace-normal text-small font-normal [&>*]:z-1 [&>*]:relative outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 before:content-[''] before:absolute before:z-0 before:inset-0 before:opacity-0 data-[selected=true]:before:opacity-100 group-data-[disabled=true]:text-foreground-300 group-data-[disabled=true]:cursor-not-allowed before:bg-default/60 data-[selected=true]:text-default-foreground first:before:rounded-l-lg rtl:first:before:rounded-r-lg rtl:first:before:rounded-l-[unset] last:before:rounded-r-lg rtl:last:before:rounded-l-lg rtl:last:before:rounded-r-[unset] text-start">
                <Textarea
                    isReadOnly
                    minRows={1}
                    variant="faded"
                    placeholder="Add note"
                    value={props.notes || "-"}
                    classNames={{
                        base: "min-w-[120px]",
                        inputWrapper:
                            "px-2 transition-colors-opacity !duration-250",
                        innerWrapper: "h-full",
                        input: "resize-none overflow-y-auto h-5 text-balance text-foreground !ease-[ease] !duration-250 !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity] placeholder:transition-colors-opacity placeholder:italic",
                    }}
                />
            </td>
            <td className="py-2 px-3 relative align-top whitespace-normal text-small font-normal [&>*]:z-1 [&>*]:relative outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 before:content-[''] before:absolute before:z-0 before:inset-0 before:opacity-0 data-[selected=true]:before:opacity-100 group-data-[disabled=true]:text-foreground-300 group-data-[disabled=true]:cursor-not-allowed before:bg-default/60 data-[selected=true]:text-default-foreground first:before:rounded-l-lg rtl:first:before:rounded-r-lg rtl:first:before:rounded-l-[unset] last:before:rounded-r-lg rtl:last:before:rounded-l-lg rtl:last:before:rounded-r-[unset]">
                <div className="flex w-full h-full items-center justify-center py-1">
                    <Tooltip
                        delay={500}
                        closeDelay={150}
                        content="Delete Rule"
                        color="danger"
                        size="sm"
                    >
                        <Button
                            isDisabled={props.loading}
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            className="text-default-400 transition-colors-opacity hover:text-danger-400"
                            onPress={() =>
                                props.onDelete({
                                    id: props.id,
                                    ip_type: props.ip_type,
                                    action: props.action,
                                    protocol: props.protocol,
                                    port: props.port,
                                    source: props.source,
                                    subnet: props.subnet,
                                    subnet_size: props.subnet_size,
                                    notes: props.notes,
                                    deleting: false,
                                })
                            }
                        >
                            <Icon path={mdiTrashCan} size={0.75} />
                        </Button>
                    </Tooltip>
                </div>
            </td>
        </tr>
    );
}
