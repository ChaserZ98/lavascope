import logging from "@lavascope/log";
import { useLingui } from "@lingui/react/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { produce } from "immer";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { toast } from "react-toastify";

import { ErrorResponse, type IListRulesResponse } from "@/lib/vultr";
import {
    addRuleAtom,
    type CreateRule,
    deleteRuleAtom,
    getCreatingRuleCountAtom,
    persistCreatingRuleAtom,
    resetNewRuleAtom,
    type Rule,
    rulesAtom,
    type RuleState,
    setRuleIsDeletingAtom,
} from "@/store/firewall";

import { useVultrAPI } from "../vultr";

export function useCreateRuleMutation() {
    const vultrAPI = useVultrAPI();

    const queryClient = useQueryClient();

    const { t } = useLingui();

    const resetNewRule = useSetAtom(resetNewRuleAtom);
    const addRule = useSetAtom(addRuleAtom);
    const deleteRule = useSetAtom(deleteRuleAtom);
    const getCreatingRuleCount = useSetAtom(getCreatingRuleCountAtom);
    const persistCreatingRule = useSetAtom(persistCreatingRuleAtom);

    const createRuleMutation = useMutation({
        mutationFn: async ({
            groupId,
            rule,
        }: {
            groupId: string;
            rule: CreateRule;
        }) =>
            await vultrAPI.firewall.createRule({
                "firewall-group-id": groupId,
                ...rule,
            }),
        onMutate: async ({ groupId, rule }) => {
            resetNewRule(groupId, rule.ip_type);
            const count = getCreatingRuleCount(groupId);
            const creatingRuleId = `creating-${count}`;
            const creatingRuleState: RuleState = {
                rule: {
                    ...rule,
                    id: Math.floor(Math.random() * 1000),
                    source: "",
                    action: "accept"
                },
                isDeleting: false,
                isCreating: true,
            };
            addRule(groupId, creatingRuleId, creatingRuleState);
            return {
                creatingRuleId,
                restore: () => deleteRule(groupId, creatingRuleId)
            };
        },
        onSuccess: async (data, { groupId }, { creatingRuleId }) => {
            logging.info(
                `Successfully created a new rule in group ${groupId} from Vultr API.`
            );
            const newRule = data.firewall_rule;
            const newRuleState: RuleState = {
                rule: newRule as Rule,
                isDeleting: false,
                isCreating: false,
            };
            persistCreatingRule(groupId, creatingRuleId, newRuleState);
            queryClient.setQueryData(
                ["rules", groupId],
                (state: IListRulesResponse) => produce(state, (draft) => {
                    draft.firewall_rules.push(newRule);
                    draft.meta.total += 1;
                })
            );
        },
        onError: (err, { groupId }, context) => {
            if (context !== undefined) context.restore();
            logging.error(
                `Failed to create a new rule in group ${groupId}: ${err}`
            );
            const message = err.message || "Unknown error";
            toast.error(t`Failed to create a new rule: ${message}`);
        },
    });

    return createRuleMutation;
}

export function useRulesQuery(groupId: string) {
    const navigate = useNavigate();

    const vultrAPI = useVultrAPI();

    const { t } = useLingui();

    const setRules = useSetAtom(rulesAtom);

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
            toast.error(t`Group with ID ${groupId} not found`);
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
        // setRules((state) => {
        //     data.forEach((rule) => {
        //         const ruleIdString = rule.id.toString();
        //         if (!state[groupId]) {
        //             state[groupId] = {
        //                 [ruleIdString]: {
        //                     rule: rule as Rule,
        //                     isDeleting: false,
        //                     isCreating: false,
        //                 },
        //             };
        //             return;
        //         }
        //         if (!state[groupId][ruleIdString]) {
        //             state[groupId][rule.id.toString()] = {
        //                 rule: rule as Rule,
        //                 isDeleting: false,
        //                 isCreating: false,
        //             };
        //             return;
        //         }
        //         state[groupId][ruleIdString].rule = rule as Rule;
        //     });
        //     Object.keys(state[groupId] || {}).forEach((key) => {
        //         if (!data.find((rule) => rule.id.toString() === key)) {
        //             if (!state[groupId]) return;
        //             if (!state[groupId][key]) return;
        //             if (state[groupId][key].isDeleting || state[groupId][key].isCreating) return;
        //             delete state[groupId][key];
        //         }
        //     });
        // });
        setRules(produce((state) => {
            data.forEach((rule) => {
                const ruleIdString = rule.id.toString();
                if (!state[groupId]) {
                    state[groupId] = {
                        [ruleIdString]: {
                            rule: rule as Rule,
                            isDeleting: false,
                            isCreating: false,
                        },
                    };
                    return;
                }
                if (!state[groupId][ruleIdString]) {
                    state[groupId][rule.id.toString()] = {
                        rule: rule as Rule,
                        isDeleting: false,
                        isCreating: false,
                    };
                    return;
                }
                state[groupId][ruleIdString].rule = rule as Rule;
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

export function useDeleteRuleMutation() {
    const vultrAPI = useVultrAPI();

    const queryClient = useQueryClient();

    const { t } = useLingui();

    const setRuleIsDeleting = useSetAtom(setRuleIsDeletingAtom);
    const deleteRule = useSetAtom(deleteRuleAtom);

    const deleteRuleMutation = useMutation({
        mutationFn: async ({
            groupId,
            ruleId,
        }: {
            groupId: string;
            ruleId: string;
        }) =>
            await vultrAPI.firewall.deleteRule({
                "firewall-group-id": groupId,
                "firewall-rule-id": ruleId,
            }),
        onMutate: ({ groupId, ruleId }) => {
            setRuleIsDeleting(groupId, ruleId, true);
        },
        onSuccess: async (_, { groupId, ruleId }) => {
            logging.info(
                `Successfully deleted the rule ${ruleId} in group ${groupId} from Vultr API.`
            );
            deleteRule(groupId, ruleId);
            queryClient.setQueryData(
                ["rules", groupId],
                (state: IListRulesResponse) => produce(state, (draft) => {
                    draft.firewall_rules = draft.firewall_rules.filter((rule) => rule.id.toString() !== ruleId);
                    draft.meta.total -= 1;
                })
            );
        },
        onError: (err, { groupId, ruleId }) => {
            setRuleIsDeleting(groupId, ruleId, false);
            logging.error(
                `Failed to delete the rule ${ruleId} in group ${groupId}: ${err}`
            );
            const message = err.message || "Unknown error";
            toast.error(t`Failed to delete the rule: ${message}`);
        },
    });

    return deleteRuleMutation;
}
