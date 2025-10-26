import { useVultrAPI } from "@lavascope/hook";
import logging from "@lavascope/log";
import { IPVersion } from "@lavascope/store";
import { VultrFirewall } from "@lavascope/store/firewlall";
import { ErrorResponse } from "@lavascope/vultr";
import { Trans } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { produce } from "immer";
import { useAtomValue, useSetAtom } from "jotai";
import { selectAtom } from "jotai/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "#components/ui";

import { RulesTable } from "./rules-table";

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

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleRefresh = useCallback(async () => {
        setIsLoading(true);
        const res = await rulesQuery.refetch();
        if (res.isError) {
            const message = res.error instanceof Error ?
                res.error.message :
                res.error;
            toast.error(() => <Trans>Failed to fetch firewall rules</Trans>, { description: message });
        }
        setIsLoading(false);
    }, []);

    return (
        <div className="flex flex-col w-full relative bg-content1 p-4 overflow-hidden min-h-60">
            <Tabs
                defaultValue={IPVersion.V4}
                aria-label="Options"
                // isVertical={screenSize === Screen.SM ? false : true}
                color="primary"
                // radius="lg"
                // size={screenSize === Screen.SM ? "sm" : "md"}
                // variant="solid"
                // classNames={{
                //     base: "flex justify-center md:px-2",
                //     tabList:
                //         "transition-colors-opacity bg-content2 my-auto",
                //     cursor: "transition-colors-opacity",
                //     tab: "transition-colors-opacity",
                //     panel: "overflow-auto md:px-0",
                // }}
            >
                <TabsList className="self-center">
                    <TabsTrigger value={IPVersion.V4}>IPv4</TabsTrigger>
                    <TabsTrigger value={IPVersion.V6}>IPv6</TabsTrigger>
                </TabsList>
                <TabsContent value={IPVersion.V4}>
                    <RulesTable
                        groupId={groupId}
                        ipVersion={IPVersion.V4}
                        rules={v4State}
                        isLoading={isLoading}
                        // onRuleDelete={onRuleDelete}
                    />
                </TabsContent>
                <TabsContent value={IPVersion.V6}>
                    <RulesTable
                        groupId={groupId}
                        ipVersion={IPVersion.V6}
                        rules={v6State}
                        isLoading={isLoading}
                        // onRuleDelete={onRuleDelete}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export { RulesTabs };
