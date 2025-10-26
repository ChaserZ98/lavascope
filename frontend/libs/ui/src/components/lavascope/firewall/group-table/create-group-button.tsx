import { useVultrAPI } from "@lavascope/hook";
import logging from "@lavascope/log";
import { IPVersion } from "@lavascope/store";
import { VultrFirewall } from "@lavascope/store/firewlall";
import type { IListGroupsResponse } from "@lavascope/vultr";
import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useSetAtom } from "jotai";
import { PlusIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Input, Label, Spinner, Tooltip, TooltipContent, TooltipTrigger } from "#components/ui";

function useCreateGroupMutation() {
    const vultrAPI = useVultrAPI();

    const queryClient = useQueryClient();

    const getCreatingGroupCount = useSetAtom(VultrFirewall.getCreatingGroupCountAtom);
    const addGroupState = useSetAtom(VultrFirewall.addGroupStateAtom);
    const deleteGroupState = useSetAtom(VultrFirewall.deleteGroupStateAtom);
    const persistCreatingGroup = useSetAtom(VultrFirewall.persistCreatingGroupAtom);

    const createGroupMutation = useMutation({
        mutationFn: async (description: string) => await vultrAPI.firewall.createGroup({ description }),
        onMutate: async (description) => {
            const count = getCreatingGroupCount();
            const creatingGroupId = `temp-${count}`;
            const creatingGroupState = {
                group: {
                    id: creatingGroupId,
                    description,
                    date_created: new Date().toISOString(),
                    date_modified: new Date().toISOString(),
                    instance_count: 0,
                    rule_count: 0,
                    max_rule_count: 0
                },
                newRule: {
                    [IPVersion.V4]: VultrFirewall.initialNewRuleIPv4,
                    [IPVersion.V6]: VultrFirewall.initialNewRuleIPv6,
                },
                newDescription: description,
                isUpdating: false,
                isDeleting: false,
                isCreating: true,
            };
            addGroupState(creatingGroupState);
            return {
                creatingGroupId,
                restore: () => {
                    deleteGroupState(creatingGroupId);
                }
            };
        },
        onSuccess: async (data, _, { creatingGroupId }) => {
            const group = data.firewall_group;
            const groupState: VultrFirewall.GroupState = {
                group,
                newRule: {
                    [IPVersion.V4]: VultrFirewall.initialNewRuleIPv4,
                    [IPVersion.V6]: VultrFirewall.initialNewRuleIPv6,
                },
                newDescription: group.description,
                isUpdating: false,
                isDeleting: false,
                isCreating: false,
            };
            persistCreatingGroup(creatingGroupId, groupState);
            queryClient.setQueryData(["groups"], (state: IListGroupsResponse) => produce(state, (draft) => {
                draft.meta.total += 1;
                draft.firewall_groups.push(group);
            }));
            logging.info(`Successfully created a new firewall group.`);
        },
        onError: (err, _, context) => {
            if (context !== undefined) context.restore();
            logging.error(`Failed to create the new firewall group: ${err}`);
            const message = err.message || "unknown error";
            toast.error(() => <Trans>Failed to create the new firewall group</Trans>, { description: message });
        },
        retry: false,
    });

    return createGroupMutation;
}

function CreateGroupButton() {
    const [description, setDescription] = useState<string>("");
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);

    const { t } = useLingui();

    const createGroupMutation = useCreateGroupMutation();

    const handleConfirm = useCallback(() => {
        if (isCreating) return;
        setIsCreating(true);
        setOpen(false);
        setIsCreating(false);
        createGroupMutation.mutate(description);
    }, [description, isCreating]);

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
                    <Label htmlFor="new-description">
                        <Trans>Description</Trans>
                    </Label>
                    <Input
                        id="new-description"
                        name="newDescription"
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

export { CreateGroupButton };
