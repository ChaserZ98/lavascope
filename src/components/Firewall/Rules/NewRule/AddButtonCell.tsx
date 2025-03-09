import { Button, Tooltip } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { toast } from "react-toastify";

import { useVultrAPI } from "@/hooks/vultr";
import { IListRulesResponse } from "@/lib/vultr";
import {
    CreateRule,
    NewRuleState,
    resetNewRuleAtom,
    setNewRuleIsCreatingAtom,
    toCreateRule,
} from "@/store/firewall";
import logging from "@/utils/log";

export default function AddButtonCell({
    newRule,
    isDisabled,
}: {
    newRule: NewRuleState;
    isDisabled?: boolean;
}) {
    const { id: groupId = "" } = useParams({
        from: "/_app/groups/$id",
    });

    const { t } = useLingui();

    const vultrAPI = useVultrAPI();

    const queryClient = useQueryClient();

    const createRuleMutation = useMutation({
        mutationFn: async (rule: CreateRule) =>
            await vultrAPI.firewall.createRule({
                "firewall-group-id": groupId,
                ...rule,
            }),
        onMutate: async (rule) => {
            setNewRuleIsCreating(groupId, rule.ip_type, true);
        },
        onSuccess: async (response, rule) => {
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
        onError: (err, rule) => {
            logging.error(
                `Failed to create a new rule in group ${groupId}: ${err}`
            );
            const message = err.message || "Unknown error";
            toast.error(t`Failed to create a new rule: ${message}`);
            setNewRuleIsCreating(groupId, rule.ip_type, false);
        },
    });

    const setNewRuleIsCreating = useSetAtom(setNewRuleIsCreatingAtom);
    const resetNewRule = useSetAtom(resetNewRuleAtom);

    const handleCreateRule = useCallback(async () => {
        await createRuleMutation.mutateAsync(toCreateRule(newRule));
    }, [newRule]);

    const isCreating = newRule.isCreating;
    const isActionDisabled = isDisabled || isCreating;

    return (
        <div className="flex w-full h-full items-center justify-center py-1">
            <Tooltip
                delay={500}
                closeDelay={150}
                content={t`Add Rule`}
                size="sm"
                color="primary"
                isDisabled={isActionDisabled}
            >
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="primary"
                    className="text-default-400 transition-colors-opacity hover:text-primary-400"
                    onPress={handleCreateRule}
                    isDisabled={isActionDisabled}
                    isLoading={isCreating}
                >
                    <Icon path={mdiPlus} size={0.75} />
                </Button>
            </Tooltip>
        </div>
    );
}
