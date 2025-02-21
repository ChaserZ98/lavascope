import {
    Pagination,
    Table,
    TableBody,
    TableColumn,
    TableHeader,
} from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { useState } from "react";

import { NewRuleState, RuleState } from "@/store/firewall/rules";
import { Version as IPVersion } from "@/store/ip";

import NewRule from "./NewRule";
import Rule from "./Rule";

type RulesTableProps = {
    ipVersion: IPVersion;
    rules: RuleState[];
    newRule: NewRuleState;
    refreshing: boolean;
    onRuleDelete: (rule: RuleState) => void;
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
                {NewRule({
                    newRule: props.newRule,
                    onRuleCreate: props.onRuleCreate,
                    ipVersion: props.newRule.ip_type,
                    onRuleChange: props.onRuleChange,
                })}
                <>
                    {props.rules.map((ruleState, index) =>
                        Rule({
                            key: index,
                            rule: ruleState.rule,
                            onDelete: props.onRuleDelete,
                            loading: props.refreshing,
                            t,
                        })
                    )}
                </>
            </TableBody>
        </Table>
    );
}
