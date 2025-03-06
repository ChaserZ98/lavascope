import {
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { useState } from "react";

import {
    NewRuleState,
    RuleState,
    SourceType,
    toProtocolDisplay,
} from "@/store/firewall";
import { Version as IPVersion } from "@/store/ip";

import {
    AddButtonCell,
    NotesCell as NewRuleNotesCell,
    PortCell as NewRulePortCell,
    ProtocolCell as NewRuleProtocolCell,
    SourceAddressCell as NewRuleSourceAddressCell,
    SourceTypeCell as NewRuleSourceTypeCell,
} from "./NewRule";
import {
    DeleteButtonCell,
    NoteCell,
    PortCell,
    ProtocolCell,
    SourceAddressCell,
    SourceTypeCell,
} from "./Rule";

type RulesTableProps = {
    ipVersion: IPVersion;
    rules: RuleState[];
    newRule: NewRuleState;
    refreshing: boolean;
    onRuleDelete: (ruleId: number) => void;
    onRuleCreate: (rule: NewRuleState) => void;
    onRuleChange: (rule: NewRuleState) => void;
};
export default function RulesTable(props: RulesTableProps) {
    const [page, setPage] = useState(1);
    const rowsPerPage = 5;
    const pages = Math.ceil(props.rules.length / rowsPerPage) || 1;

    const { t } = useLingui();

    return (
        <Table
            aria-label="IP Table"
            classNames={{
                wrapper: "transition-colors-opacity bg-content2",
                th: "transition-colors-opacity text-xs font-light bg-content3 sm:text-sm sm:font-bold",
                td: "transition-colors-opacity text-xs sm:text-sm text-foreground font-mono",
                base:
                    "overflow-x-auto" +
                    (props.refreshing ? "animate-pulse" : ""),
            }}
            isKeyboardNavigationDisabled
            topContent={
                <div className="sticky left-1/2 -translate-x-1/2 w-fit">
                    <Pagination
                        isDisabled={props.refreshing}
                        showControls
                        color="primary"
                        variant="flat"
                        page={page}
                        total={pages}
                        onChange={(page) => setPage(page)}
                        classNames={{
                            item: "text-foreground !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,transform,background] !ease-[ease] !duration-250 bg-content3 [&[data-hover=true]:not([data-active=true])]:bg-content4",
                            prev: "text-foreground transition-colors-opacity bg-content3 [&[data-hover=true]:not([data-active=true])]:bg-content4 data-[disabled=true]:text-default-400",
                            next: "text-foreground transition-colors-opacity bg-content3 [&[data-hover=true]:not([data-active=true])]:bg-content4 data-[disabled=true]:text-default-400",
                        }}
                    />
                </div>
            }
        >
            <TableHeader>
                {[
                    t`Protocol`,
                    t`Port`,
                    t`Source Type`,
                    t`Source`,
                    t`Notes`,
                    t`Actions`,
                ].map((head) => (
                    <TableColumn key={head} align="center">
                        {head}
                    </TableColumn>
                ))}
            </TableHeader>
            <TableBody emptyContent="Empty">
                <TableRow>
                    <TableCell>
                        <NewRuleProtocolCell
                            isDisabled={props.refreshing}
                            newRule={props.newRule}
                            onRuleChange={props.onRuleChange}
                        />
                    </TableCell>
                    <TableCell>
                        <NewRulePortCell
                            isDisabled={props.refreshing}
                            newRule={props.newRule}
                            onRuleChange={props.onRuleChange}
                        />
                    </TableCell>
                    <TableCell>
                        <NewRuleSourceTypeCell
                            isDisabled={props.refreshing}
                            newRule={props.newRule}
                            onRuleChange={props.onRuleChange}
                        />
                    </TableCell>
                    <TableCell>
                        <NewRuleSourceAddressCell
                            isDisabled={props.refreshing}
                            newRule={props.newRule}
                            onRuleChange={props.onRuleChange}
                        />
                    </TableCell>
                    <TableCell>
                        <NewRuleNotesCell
                            isDisabled={props.refreshing}
                            newRule={props.newRule}
                            onRuleChange={props.onRuleChange}
                        />
                    </TableCell>
                    <TableCell>
                        <AddButtonCell
                            newRule={props.newRule}
                            onPress={() => props.onRuleCreate(props.newRule)}
                            isDisabled={props.refreshing}
                        />
                    </TableCell>
                </TableRow>
                <>
                    {props.rules.map((ruleState, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <ProtocolCell
                                    value={toProtocolDisplay(
                                        ruleState.rule.protocol,
                                        ruleState.rule.port
                                    )}
                                />
                            </TableCell>
                            <TableCell>
                                <PortCell value={ruleState.rule.port || "-"} />
                            </TableCell>
                            <TableCell>
                                <SourceTypeCell
                                    value={
                                        ruleState.rule.source ||
                                        (ruleState.rule.subnet === "::" ||
                                        ruleState.rule.subnet === "0.0.0.0"
                                            ? t`anywhere`
                                            : t`custom`)
                                    }
                                />
                            </TableCell>
                            <TableCell>
                                <SourceAddressCell
                                    value={
                                        ruleState.rule.source ===
                                        SourceType.CLOUDFLARE
                                            ? "cloudflare"
                                            : `${ruleState.rule.subnet}/${ruleState.rule.subnet_size}`
                                    }
                                />
                            </TableCell>
                            <TableCell>
                                <NoteCell value={ruleState.rule.notes || "-"} />
                            </TableCell>
                            <TableCell>
                                <DeleteButtonCell
                                    isDisabled={
                                        props.refreshing || ruleState.deleting
                                    }
                                    isLoading={ruleState.deleting}
                                    onDelete={() =>
                                        props.onRuleDelete(ruleState.rule.id)
                                    }
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </>
            </TableBody>
        </Table>
    );
}
