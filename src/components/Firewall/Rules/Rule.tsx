import {
    Button,
    Input,
    TableCell,
    TableRow,
    Textarea,
    Tooltip,
} from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { mdiTrashCan } from "@mdi/js";
import Icon from "@mdi/react";

import {
    Rule,
    RuleState,
    SourceType,
    toProtocolDisplay,
} from "@/store/firewall";

interface RuleProps extends React.ComponentProps<"tr"> {
    rule: Rule;
    loading: boolean;
    onDelete: (rule: RuleState) => void;
    t: ReturnType<typeof useLingui>["t"];
}

export default function RuleComponent(props: RuleProps) {
    const rule = props.rule;
    const t = props.t;

    return (
        <TableRow key={props.key}>
            <TableCell>
                <Input
                    isReadOnly
                    placeholder="Protocol"
                    aria-label="Protocol"
                    variant="faded"
                    value={toProtocolDisplay(rule.protocol, rule.port)}
                    classNames={{
                        base: "min-w-[150px]",
                        inputWrapper: "transition-colors-opacity !duration-250",
                        input: "text-foreground transition-colors-opacity",
                    }}
                />
            </TableCell>
            <TableCell>
                <Input
                    isReadOnly
                    placeholder="Port"
                    aria-label="Port"
                    variant="faded"
                    value={rule.port || "-"}
                    classNames={{
                        base: "min-w-[80px]",
                        inputWrapper: "transition-colors-opacity !duration-250",
                        input: "text-foreground transition-colors-opacity",
                    }}
                />
            </TableCell>
            <TableCell>
                <Input
                    isReadOnly
                    placeholder="Source Type"
                    aria-label="Source Type"
                    variant="faded"
                    value={
                        rule.source ||
                        (rule.subnet === "::" || rule.subnet === "0.0.0.0"
                            ? t`anywhere`
                            : t`custom`)
                    }
                    classNames={{
                        base: "min-w-[130px]",
                        inputWrapper: "transition-colors-opacity !duration-250",
                        input: "text-foreground transition-colors-opacity capitalize",
                    }}
                />
            </TableCell>
            <TableCell>
                <Textarea
                    isReadOnly
                    minRows={1}
                    maxRows={4}
                    variant="faded"
                    placeholder="Source Address"
                    value={
                        rule.source === SourceType.CLOUDFLARE
                            ? "cloudflare"
                            : `${rule.subnet}/${rule.subnet_size}`
                    }
                    classNames={{
                        base: "min-w-[150px]",
                        inputWrapper:
                            "px-2 transition-colors-opacity !duration-250",
                        innerWrapper: "h-full",
                        input: "resize-none h-5 text-foreground !ease-[ease] !duration-250 !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity] placeholder:transition-colors-opacity placeholder:italic",
                    }}
                />
            </TableCell>
            <TableCell>
                <Textarea
                    isReadOnly
                    minRows={1}
                    variant="faded"
                    placeholder="Add note"
                    value={rule.notes || "-"}
                    classNames={{
                        base: "min-w-[120px]",
                        inputWrapper:
                            "px-2 transition-colors-opacity !duration-250",
                        innerWrapper: "h-full",
                        input: "resize-none overflow-y-auto h-5 text-balance text-foreground !ease-[ease] !duration-250 !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity] placeholder:transition-colors-opacity placeholder:italic",
                    }}
                />
            </TableCell>
            <TableCell>
                <div className="flex w-full h-full items-center justify-center py-1">
                    <Tooltip
                        delay={500}
                        closeDelay={150}
                        content={t`Delete Rule`}
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
                                    rule,
                                    deleting: false,
                                })
                            }
                        >
                            <Icon path={mdiTrashCan} size={0.75} />
                        </Button>
                    </Tooltip>
                </div>
            </TableCell>
        </TableRow>
    );
}
