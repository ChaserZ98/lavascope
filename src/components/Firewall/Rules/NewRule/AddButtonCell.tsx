import { Button, Tooltip } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { useParams } from "@tanstack/react-router";
import { useCallback } from "react";

import { useCreateRuleMutation } from "@/hooks/Firewall";
import { NewRuleState, toCreateRule } from "@/store/firewall";

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

    const createRuleMutation = useCreateRuleMutation();

    const handleCreateRule = useCallback(async () => {
        await createRuleMutation.mutateAsync({
            groupId,
            rule: toCreateRule(newRule),
        });
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
