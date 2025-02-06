import { useState } from "react";

import { Pagination } from "@heroui/react";

import { NewRuleState, RuleState } from "@/zustand/firewall/rules";
import { Version as IPVersion } from "@/zustand/ip";
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

    return (
        <div className="flex flex-col relative justify-between gap-4 bg-content2 p-4 overflow-auto rounded-large shadow-small shadow-content2 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow] ease-[ease] duration-250 select-none w-fit">
            <div className="mx-auto sticky left-1/2 -translate-x-1/2">
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
            <table className="min-w-full h-auto table-auto w-full">
                <thead className="[&>tr]:first:rounded-lg">
                    <tr className="group outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2">
                        {[
                            "Protocol",
                            "Port",
                            "Source Type",
                            "Source",
                            "Notes",
                            "Actions",
                        ].map((head) => (
                            <th
                                className="group px-3 h-10 align-middle bg-content3 whitespace-nowrap text-foreground-500 text-tiny font-semibold first:rounded-l-lg rtl:first:rounded-r-lg rtl:first:rounded-l-[unset] last:rounded-r-lg rtl:last:rounded-l-lg rtl:last:rounded-r-[unset] data-[sortable=true]:cursor-pointer data-[hover=true]:text-foreground-400 outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 text-start transition-colors-opacity"
                                key={head}
                            >
                                {head}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <NewRule
                        ipVersion={props.newRule.ip_type}
                        onRuleChange={props.onRuleChange}
                        onRuleCreate={props.onRuleCreate}
                        isLoading={props.newRule.creating}
                        newRule={props.newRule}
                    />
                    {props.rules
                        .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                        .map((rule) => {
                            return (
                                <Rule
                                    key={rule.id}
                                    loading={props.refreshing || rule.deleting}
                                    {...rule}
                                    onDelete={props.onRuleDelete}
                                />
                            );
                        })}
                </tbody>
            </table>
        </div>
    );
}
