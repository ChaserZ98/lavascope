import { useVultrAPI } from "@lavascope/hook";
import logging from "@lavascope/log";
import { VultrFirewall } from "@lavascope/store/firewlall";
import type { IListGroupsResponse } from "@lavascope/vultr";
import { Trans } from "@lingui/react/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useSetAtom } from "jotai";
import { TrashIcon } from "lucide-react";
import { type ComponentProps, useCallback, useState } from "react";
import { toast } from "sonner";

import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Spinner, Tooltip, TooltipContent, TooltipTrigger } from "#components/ui";

function useDeleteGroupMutation() {
    const vultrAPI = useVultrAPI();

    const queryClient = useQueryClient();

    const setGroupIsDeleting = useSetAtom(VultrFirewall.setGroupIsDeletingAtom);
    const deleteGroupState = useSetAtom(VultrFirewall.deleteGroupStateAtom);

    const deleteGroupMutation = useMutation({
        mutationKey: ["groups"],
        mutationFn: async (groupId: string) =>
            await vultrAPI.firewall.deleteGroup({
                "firewall-group-id": groupId,
            }),
        onMutate: async (groupId) => {
            setGroupIsDeleting(groupId, true);
        },
        onSuccess: async (_, groupId) => {
            deleteGroupState(groupId);
            queryClient.setQueryData(["groups"], (state: IListGroupsResponse) =>
                produce(state, (draft) => {
                    draft.meta.total -= 1;
                    draft.firewall_groups = draft.firewall_groups.filter((group) => group.id !== groupId);
                })
            );
            logging.info(`Successfully deleted group with ID ${groupId}`);
            toast.success(() => <Trans>Successfully deleted group with ID {groupId}</Trans>);
        },
        onError: (err) => {
            logging.error(`Failed to delete group: ${err}`);
            const message = err.message || "unknown error";
            toast.error(() => <Trans>Failed to delete group</Trans>, { description: message });
        },
        onSettled: (_res, _err, groupId: string) => {
            setGroupIsDeleting(groupId, false);
        },
    });

    return deleteGroupMutation;
}

function DeleteGroupButton({ group, ...props }: { group: VultrFirewall.Group } & ComponentProps<typeof Button>) {
    const [open, setOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const deleteGroupMutation = useDeleteGroupMutation();

    const handleConfirm = useCallback(() => {
        if (isDeleting) return;
        setIsDeleting(true);
        setOpen(false);
        setIsDeleting(false);
        deleteGroupMutation.mutate(group.id);
    }, [isDeleting, group.id]);

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <Tooltip delayDuration={1000}>
                <TooltipTrigger asChild>
                    <Button
                        size="icon-sm"
                        className="bg-transparent text-foreground hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
                        onClick={() => setOpen(true)}
                        {...props}
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
                            Are you sure you want to delete this firewall group?
                        </Trans>
                    </DialogTitle>
                    <DialogDescription />
                    <div className="text-popover-foreground">
                        <p>
                            <span>
                                <Trans>ID: </Trans>
                            </span>
                            <span className="font-mono">{group.id}</span>
                        </p>
                        <p>
                            <span>
                                <Trans>Description: </Trans>
                            </span>
                            <span className="font-mono">
                                {group.description}
                            </span>
                        </p>
                        <p>
                            <span>
                                <Trans>Date Created: </Trans>
                            </span>
                            <span className="font-mono">
                                {new Date(group.date_created).toLocaleString()}
                            </span>
                        </p>
                        <p>
                            <span>
                                <Trans>Rules: </Trans>
                            </span>
                            <span className="font-mono">
                                {group.rule_count}
                            </span>
                        </p>
                        <p>
                            <span>
                                <Trans>Instances: </Trans>
                            </span>
                            <span className="font-mono">
                                {group.instance_count}
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

export { DeleteGroupButton };
