import { useVultrAPI } from "@lavascope/hook";
import logging from "@lavascope/log";
import { IPVersion } from "@lavascope/store";
import { VultrFirewall } from "@lavascope/store/firewlall";
import { ErrorResponse } from "@lavascope/vultr";
import { Trans } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, type PaginationState, type SortingState, useReactTable, type VisibilityState } from "@tanstack/react-table";
import { produce } from "immer";
import { useAtomValue, useSetAtom } from "jotai";
import { selectAtom } from "jotai/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ToggleGroup, ToggleGroupItem } from "#components/ui";

import { ColumnsFilterSelect } from "./columns-filter-select";
import { CreateRuleButton } from "./create-rule-button";
import { RefreshButton } from "./refresh-button";
import { type ColumnData, columns, RulesTable } from "./rules-table";

function useRulesQuery(groupId: string) {
    const navigate = useNavigate();

    const vultrAPI = useVultrAPI();

    const setRules = useSetAtom(VultrFirewall.rulesAtom);

    const rulesQuery = useQuery({
        queryKey: ["rules", groupId],
        staleTime: 1000 * 30, // 30 seconds
        queryFn: async () =>
            await vultrAPI.firewall.listRules({ "firewall-group-id": groupId }),
        select: (data) => data.firewall_rules,
        retry: false,
    });

    useEffect(() => {
        if (!rulesQuery.isError) return;

        const error = rulesQuery.error;
        if (error instanceof ErrorResponse && error.statusCode === 404) {
            logging.warn(
                `Failed to fetch firewall rules for group ${groupId}: ${error}`
            );
            toast.error(() => <Trans>Group with ID {groupId} not found</Trans>);
            navigate({
                to: "/",
            });
            return;
        }
        logging.error(
            `Failed to fetch firewall rules for group ${groupId}: ${rulesQuery.error}`
        );
    }, [rulesQuery.isError]);

    useEffect(() => {
        const data = rulesQuery.data || [];
        setRules(produce((state) => {
            data.forEach((rule) => {
                const ruleIdString = rule.id.toString();
                if (!state[groupId]) {
                    state[groupId] = {
                        [ruleIdString]: {
                            rule: rule as VultrFirewall.Rule,
                            isDeleting: false,
                            isCreating: false,
                        },
                    };
                    return;
                }
                if (!state[groupId][ruleIdString]) {
                    state[groupId][rule.id.toString()] = {
                        rule: rule as VultrFirewall.Rule,
                        isDeleting: false,
                        isCreating: false,
                    };
                    return;
                }
                state[groupId][ruleIdString].rule = rule as VultrFirewall.Rule;
            });
            Object.keys(state[groupId] || {}).forEach((key) => {
                if (!data.find((rule) => rule.id.toString() === key)) {
                    if (!state[groupId]) return;
                    if (!state[groupId][key]) return;
                    if (state[groupId][key].isDeleting || state[groupId][key].isCreating) return;
                    delete state[groupId][key];
                }
            });
        }));
    }, [rulesQuery.data]);

    return rulesQuery;
}

function RulesTabs({ groupId }: { groupId: string }) {
    const groupRulesAtom = useMemo(() => selectAtom(VultrFirewall.rulesAtom, (state) => state[groupId] || {}), []);

    const rulesQuery = useRulesQuery(groupId);

    const rulesState = useAtomValue(groupRulesAtom);

    const [ipVersion, setIPVersion] = useState<IPVersion>(IPVersion.V4);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });

    const v4State = useMemo(() => {
        const rules = [];
        for (const rule in rulesState) {
            if (rulesState[rule] === undefined) continue;
            if (rulesState[rule].rule.ip_type === IPVersion.V4) {
                rules.push(rulesState[rule]);
            }
        }
        return rules;
    }, [rulesState]);

    const v6State = useMemo(() => {
        const rules = [];
        for (const rule in rulesState) {
            if (rulesState[rule] === undefined) continue;
            if (rulesState[rule].rule.ip_type === IPVersion.V6) {
                rules.push(rulesState[rule]);
            }
        }
        return rules;
    }, [rulesState]);

    const data = useMemo<ColumnData[]>(() => {
        const state = ipVersion === IPVersion.V4 ? v4State : v6State;
        return state.map((rule) => ({ ...rule, groupId, isTableLoading: isLoading }));
    }, [v4State, v6State, ipVersion, groupId, isLoading]);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnVisibility,
            pagination
        }
    });

    const handleRefresh = useCallback(async () => {
        setIsLoading(true);
        const res = await rulesQuery.refetch();
        if (res.isError) {
            const message = res.error.message;
            toast.error(() => <Trans>Failed to fetch firewall rules</Trans>, { description: message });
        }
        setIsLoading(false);
    }, []);

    return (
        <div className="w-full space-y-2">
            <div className="flex justify-center items-center">
                <ToggleGroup
                    variant="outline"
                    type="single"
                    value={ipVersion}
                    onValueChange={(v) => {
                        if (v.length === 0) return;
                        setIPVersion(v as IPVersion);
                    }}
                    className="static sm:absolute"
                >
                    <ToggleGroupItem
                        value={IPVersion.V4}
                        className={ipVersion !== IPVersion.V4 ? "cursor-pointer" : ""}
                    >
                        IPv4
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value={IPVersion.V6}
                        className={ipVersion !== IPVersion.V6 ? "cursor-pointer" : ""}
                    >
                        IPv6
                    </ToggleGroupItem>
                </ToggleGroup>
                <ColumnsFilterSelect table={table} />
                <CreateRuleButton groupId={groupId} ipVersion={ipVersion} />
                <RefreshButton isLoading={isLoading} onClick={handleRefresh} />
            </div>
            <RulesTable table={table} isLoading={isLoading} />
        </div>
    );
}

export { RulesTabs };
