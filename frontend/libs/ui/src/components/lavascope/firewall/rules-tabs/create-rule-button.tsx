import { useVultrAPI } from "@lavascope/hook";
import logging from "@lavascope/log";
import { IPVersion } from "@lavascope/store";
import { VultrFirewall } from "@lavascope/store/firewlall";
import type { IListRulesResponse } from "@lavascope/vultr";
import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useSetAtom } from "jotai";
import { PlusIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Input, Label, Spinner, Tooltip, TooltipContent, TooltipTrigger } from "#components/ui";

function useCreateRuleMutation() {
    const vultrAPI = useVultrAPI();

    const queryClient = useQueryClient();

    const resetNewRule = useSetAtom(VultrFirewall.resetNewRuleAtom);
    const addRule = useSetAtom(VultrFirewall.addRuleAtom);
    const deleteRule = useSetAtom(VultrFirewall.deleteRuleAtom);
    const getCreatingRuleCount = useSetAtom(VultrFirewall.getCreatingRuleCountAtom);
    const persistCreatingRule = useSetAtom(VultrFirewall.persistCreatingRuleAtom);

    const createRuleMutation = useMutation({
        mutationFn: async ({
            groupId,
            rule,
        }: {
            groupId: string;
            rule: VultrFirewall.CreateRule;
        }) =>
            await vultrAPI.firewall.createRule({
                "firewall-group-id": groupId,
                ...rule,
            }),
        onMutate: async ({ groupId, rule }) => {
            resetNewRule(groupId, rule.ip_type);
            const count = getCreatingRuleCount(groupId);
            const creatingRuleId = `creating-${count}`;
            const creatingRuleState: VultrFirewall.RuleState = {
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
            const newRuleState: VultrFirewall.RuleState = {
                rule: newRule as VultrFirewall.Rule,
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
            toast.error(() => <Trans>Failed to create the new rule</Trans>, { description: message });
        },
    });

    return createRuleMutation;
}

function CreateRuleButton({ groupId, ipVersion }: { groupId: string; ipVersion: IPVersion }) {
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);
    const [newRule, setNewRule] = useState<VultrFirewall.NewRuleState>(ipVersion === IPVersion.V4 ? VultrFirewall.initialNewRuleIPv4 : VultrFirewall.initialNewRuleIPv6);

    const { t } = useLingui();

    const createRuleMutation = useCreateRuleMutation();

    const handleConfirm = useCallback(() => {
        setIsCreating(true);
        setOpen(false);
        setIsCreating(false);
        createRuleMutation.mutate({
            groupId,
            rule: VultrFirewall.toCreateRule(newRule),
        });
    }, [newRule]);

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
                setDescription("");
            }}
        >
            <Tooltip delayDuration={1000}>
                <TooltipTrigger asChild>
                    <Button
                        className="ml-2 h-full bg-accent text-accent-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setOpen(true)}
                    >
                        <DialogTrigger asChild>
                            <PlusIcon />
                        </DialogTrigger>
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="select-none">
                    <Trans>Create Group</Trans>
                </TooltipContent>
            </Tooltip>
            <DialogContent className="select-none">
                <DialogHeader>
                    <DialogTitle>
                        <Trans>New Firewall Group</Trans>
                    </DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                <div className="space-y-3">
                    <Label htmlFor="new-rule-protocol">
                        <Trans>Protocol</Trans>
                    </Label>
                    <Input
                        id="new-rule-protocol"
                        name="newRuleProtocol"
                        placeholder={t`Enter description here...`}
                        disabled={isCreating}
                        value={newRule.protocol}
                        onChange={(e) => setNewRule(produce((draft) => {
                            draft.protocol = e.target.value;
                        }))}
                    />
                    <Label htmlFor="new-rule-protocol">
                        <Trans>Port</Trans>
                    </Label>
                    <Input
                        id="new-rule-port"
                        name="newRulePort"
                        placeholder={t`Enter description here...`}
                        disabled={isCreating}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Label htmlFor="new-rule-protocol">
                        <Trans>Source Type</Trans>
                    </Label>
                    <Input
                        id="new-rule-protocol"
                        name="newRuleProtocol"
                        placeholder={t`Enter description here...`}
                        disabled={isCreating}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Label htmlFor="new-rule-protocol">
                        <Trans>Source</Trans>
                    </Label>
                    <Input
                        id="new-rule-protocol"
                        name="newRuleProtocol"
                        placeholder={t`Enter description here...`}
                        disabled={isCreating}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Label htmlFor="new-rule-protocol">
                        <Trans>Notes</Trans>
                    </Label>
                    <Input
                        id="new-rule-protocol"
                        name="newRuleProtocol"
                        placeholder={t`Enter description here...`}
                        disabled={isCreating}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button
                        className="cursor-pointer"
                        disabled={isCreating}
                        onClick={() => handleConfirm()}
                    >
                        {
                            isCreating && <Spinner />
                        }
                        <Trans>Confirm</Trans>
                    </Button>
                    <DialogClose asChild>
                        <Button className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/80">
                            <Trans>Cancel</Trans>
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export { CreateRuleButton };
