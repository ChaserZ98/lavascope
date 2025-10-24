import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@heroui/react";
import { IPVersion } from "@lavascope/store";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@lavascope/ui/components/ui";
import { useLingui } from "@lingui/react/macro";
import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { useCallback, useState } from "react";

import {
    groupsStateAtom,
    initialNewRuleIPv4,
    initialNewRuleIPv6,
    type RuleState,
    SourceType,
    toProtocolDisplay,
} from "@/store/firewall";

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

type RulesPaginationProps = {
    page?: number;
    total?: number;
};

function RulesPagination({ page = 1, total = 1 }: RulesPaginationProps) {
    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious>
                    </PaginationPrevious>
                </PaginationItem>
                <PaginationItem>
                    <PaginationNext></PaginationNext>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}

type RulesTableProps = {
    groupId: string;
    ipVersion: IPVersion;
    rules: RuleState[];
    isLoading?: boolean;
};
function RulesTable({ groupId, ipVersion, rules, isLoading }: RulesTableProps) {
    // const { id: groupId = "" } = useParams({
    //     from: "/_app/groups/$id",
    // });

    const { t } = useLingui();

    const newRule =
        useAtomValue(
            selectAtom(
                groupsStateAtom,
                useCallback(
                    (state) => state[groupId]?.newRule[ipVersion],
                    [groupId, ipVersion]
                )
            )
        ) ||
        (ipVersion === IPVersion.V4 ? initialNewRuleIPv4 : initialNewRuleIPv6);

    const [page, setPage] = useState(1);

    const rowsPerPage = 5;
    const pages = Math.ceil(props.rules.length / rowsPerPage) || 1;
    if (page > pages) setPage(pages);

    const displayedRules = rules.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    return (
        <Table
            aria-label="IP Table"
            classNames={{
                wrapper: "transition-colors-opacity bg-content2",
                th: "transition-colors-opacity text-xs font-light bg-content3 sm:text-sm sm:font-bold",
                td: "align-top transition-colors-opacity text-xs sm:text-sm text-foreground font-mono",
                base:
                    "overflow-x-auto" +
                    (isLoading ? "animate-pulse" : ""),
            }}
            isKeyboardNavigationDisabled
            topContent={(
                <div className="sticky left-1/2 -translate-x-1/2 w-fit">
                    <RulesPagination />
                    {/* <Pagination
                        isDisabled={isLoading}
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
                    /> */}
                </div>
            )}
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
                            isDisabled={isLoading}
                            newRule={newRule}
                        />
                    </TableCell>
                    <TableCell>
                        <NewRulePortCell
                            isDisabled={isLoading}
                            newRule={newRule}
                        />
                    </TableCell>
                    <TableCell>
                        <NewRuleSourceTypeCell
                            isDisabled={isLoading}
                            newRule={newRule}
                        />
                    </TableCell>
                    <TableCell>
                        <NewRuleSourceAddressCell
                            isDisabled={isLoading}
                            newRule={newRule}
                        />
                    </TableCell>
                    <TableCell>
                        <NewRuleNotesCell
                            isDisabled={isLoading}
                            newRule={newRule}
                        />
                    </TableCell>
                    <TableCell>
                        <AddButtonCell
                            newRule={newRule}
                            isDisabled={isLoading}
                        />
                    </TableCell>
                </TableRow>
                <>
                    {displayedRules.map((ruleState, index) => (
                        <TableRow key={index} className={ruleState.isDeleting || ruleState.isCreating ? "animate-pulse" : ""}>
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
                                    source={ruleState.rule.source}
                                    subnet={ruleState.rule.subnet}
                                />
                            </TableCell>
                            <TableCell>
                                <SourceAddressCell
                                    value={
                                        ruleState.rule.source ===
                                        SourceType.CLOUDFLARE ?
                                            "cloudflare" :
                                            `${ruleState.rule.subnet}/${ruleState.rule.subnet_size}`
                                    }
                                />
                            </TableCell>
                            <TableCell>
                                <NoteCell value={ruleState.rule.notes || "-"} />
                            </TableCell>
                            <TableCell>
                                <DeleteButtonCell
                                    isDisabled={
                                        isLoading || ruleState.isDeleting
                                    }
                                    isLoading={ruleState.isDeleting}
                                    // onDelete={() => props.onRuleDelete(ruleState.rule)}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </>
            </TableBody>
        </Table>
    );
}

export { RulesTable };
