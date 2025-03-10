import { useLingui } from "@lingui/react/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { toast } from "react-toastify";

import { ErrorResponse, IListRulesResponse, RequestError } from "@/lib/vultr";
import {
    CreateRule,
    deleteRuleAtom,
    resetNewRuleAtom,
    Rule,
    rulesAtom,
    setNewRuleIsCreatingAtom,
    setRuleIsDeletingAtom,
} from "@/store/firewall";
import logging from "@/utils/log";

import { useVultrAPI } from "../vultr";

export function useCreateRuleMutation() {
    const vultrAPI = useVultrAPI();

    const queryClient = useQueryClient();

    const { t } = useLingui();

    const setNewRuleIsCreating = useSetAtom(setNewRuleIsCreatingAtom);
    const resetNewRule = useSetAtom(resetNewRuleAtom);

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
            setNewRuleIsCreating(groupId, rule.ip_type, true);
        },
        onSuccess: async (response, { groupId, rule }) => {
            logging.info(
                `Successfully created a new rule in group ${groupId} from Vultr API.`
            );
            const newRule = response.firewall_rule;
            queryClient.setQueryData(
                ["rules", groupId],
                (state: IListRulesResponse) => {
                    return {
                        firewall_rules: [...state.firewall_rules, newRule],
                        meta: {
                            ...state.meta,
                            total: state.meta.total + 1,
                        },
                    };
                }
            );
            await queryClient.invalidateQueries({
                queryKey: ["rules", groupId],
            });
            resetNewRule(groupId, rule.ip_type);
        },
        onError: (err, { groupId, rule }) => {
            logging.error(
                `Failed to create a new rule in group ${groupId}: ${err}`
            );
            const message = err.message || "Unknown error";
            toast.error(t`Failed to create a new rule: ${message}`);
            setNewRuleIsCreating(groupId, rule.ip_type, false);
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
    });

    useEffect(() => {
        if (rulesQuery.isError) {
            const error = rulesQuery.error;
            if (error instanceof ErrorResponse) {
                if (error.statusCode === 404) {
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
                const message = rulesQuery.error.message;
                toast.error(t`Failed to fetch rules: ${message}`);
                return;
            }
            if (error instanceof RequestError) {
                logging.error(
                    `Failed to fetch firewall rules for group ${groupId}: ${rulesQuery.error}`
                );
                const message = rulesQuery.error.message;
                toast.error(t`Failed to fetch rules: ${message}`);
                return;
            }
            logging.error(
                `Failed to fetch firewall rules for group ${groupId}: ${rulesQuery.error}`
            );
            const message = error.message || "Unknown error";
            toast.error(t`Failed to fetch rules: ${message}`);
        }
    }, [rulesQuery.isError]);

    useEffect(() => {
        const data = rulesQuery.data || [];
        setRules((state) => {
            data.forEach((rule) => {
                if (!state[groupId]) {
                    state[groupId] = {};
                }
                if (!state[groupId][rule.id.toString()]) {
                    state[groupId][rule.id.toString()] = {
                        rule: rule as Rule,
                        isDeleting: false,
                    };
                } else {
                    state[groupId][rule.id.toString()].rule = rule as Rule;
                }
            });
            Object.keys(state[groupId]).forEach((key) => {
                if (!data.find((rule) => rule.id.toString() === key)) {
                    delete state[groupId][key];
                }
            });
        });
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
            await queryClient.invalidateQueries({
                queryKey: ["rules", groupId],
            });
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
