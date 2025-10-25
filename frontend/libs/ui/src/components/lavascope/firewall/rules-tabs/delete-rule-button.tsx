import { useVultrAPI } from "@lavascope/hook";
import logging from "@lavascope/log";
import { IPVersion } from "@lavascope/store";
import { VultrFirewall } from "@lavascope/store/firewlall";
import type { IListRulesResponse } from "@lavascope/vultr";
import { Trans } from "@lingui/react/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useSetAtom } from "jotai";
import { TrashIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Spinner, Tooltip, TooltipContent, TooltipTrigger } from "#components/ui";

function useDeleteRuleMutation() {
    const vultrAPI = useVultrAPI();

    const queryClient = useQueryClient();

    const setRuleIsDeleting = useSetAtom(VultrFirewall.setRuleIsDeletingAtom);
    const deleteRule = useSetAtom(VultrFirewall.deleteRuleAtom);

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
            toast.error(() => <Trans>Failed to delete the rule</Trans>, { description: message });
        },
    });

    return deleteRuleMutation;
}

function DeleteRuleButton({ rule, groupId }: { rule: VultrFirewall.Rule; groupId: string }) {
    const [open, setOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const deleteRuleMutation = useDeleteRuleMutation();

    const handleConfirm = useCallback(() => {
        if (!rule || isDeleting) return;
        setIsDeleting(true);
        setOpen(false);
        setIsDeleting(false);
        deleteRuleMutation.mutate({
            groupId,
            ruleId: rule.id.toString(),
        });
    }, [rule, isDeleting]);

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => setOpen(v)}
        >
            <Tooltip delayDuration={1000}>
                <TooltipTrigger asChild>
                    <Button
                        size="icon-sm"
                        className="bg-transparent text-foreground hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
                        onClick={() => setOpen(true)}
                    >
                        <DialogTrigger asChild>
                            <TrashIcon />
                        </DialogTrigger>
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="select-none" color="destructive">
                    <Trans>Delete</Trans>
                </TooltipContent>
            </Tooltip>
            <DialogContent className="select-none">
                <DialogHeader>
                    <DialogTitle className="text-lg">
                        <Trans>
                            Are you sure you want to delete this rule?
                        </Trans>
                    </DialogTitle>
                    <DialogDescription />
                    <div className="text-popover-foreground">
                        <p>
                            <span>
                                <Trans>IP Version</Trans>{": "}
                            </span>
                            <span className="font-mono">
                                {rule.ip_type === IPVersion.V4 ? "IPv4" : "IPv6"}
                            </span>
                        </p>
                        <p>
                            <span>
                                <Trans>Protocol</Trans>{": "}
                            </span>
                            <span className="font-mono">
                                {VultrFirewall.toProtocolDisplay(rule.protocol, rule.port)}
                            </span>
                        </p>
                        <p>
                            <span>
                                <Trans>Port</Trans>{": "}
                            </span>
                            <span className="font-mono">
                                {rule.port}
                            </span>
                        </p>
                        <p>
                            <span>
                                <Trans>Source Type</Trans>{": "}
                            </span>
                            <span className="font-mono">
                                {rule.source}
                            </span>
                        </p>
                        <p>
                            <span>
                                <Trans>Source Address</Trans>{": "}
                            </span>
                            <span className="font-mono">
                                {`${rule.subnet}/${rule.subnet_size}`}
                            </span>
                        </p>
                        <p>
                            <span>
                                <Trans>Notes</Trans>{": "}
                            </span>
                            <span className="font-mono">
                                {rule.notes}
                            </span>
                        </p>
                    </div>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        className="cursor-pointer"
                        disabled={isDeleting}
                        onClick={() => handleConfirm()}
                    >
                        {
                            isDeleting && <Spinner />
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

export { DeleteRuleButton };
