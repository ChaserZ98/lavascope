import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

import { useVultrAPI } from "@/hooks/vultr";
import { IFirewallGroup } from "@/lib/vultr/types";
import { setGroupIsDeletingAtom } from "@/store/firewall";
import logging from "@/utils/log";

export default function DeleteGroupModal({
    group,
    isOpen,
    onClose = () => {},
}: {
    group: IFirewallGroup | null;
    isOpen: boolean;
    onClose?: () => void;
}) {
    const vultrAPI = useVultrAPI();

    const { t } = useLingui();

    const queryClient = useQueryClient();

    const setGroupIsDeleting = useSetAtom(setGroupIsDeletingAtom);

    const deleteGroupMutation = useMutation({
        mutationFn: async (groupId: string) =>
            await vultrAPI.firewall.deleteGroup({
                "firewall-group-id": groupId,
            }),
        onMutate: async (groupId) => {
            setGroupIsDeleting(groupId, true);
        },
        onSuccess: async (_, groupId) => {
            logging.info(`Successfully deleted group with ID ${groupId}`);
            toast.success(t`Successfully deleted group with ID ${groupId}`);
            await queryClient.invalidateQueries({
                queryKey: ["groups"],
            });
        },
        onError: (err) => {
            logging.error(`Failed to delete group: ${err}`);
            const message = err.message || "unknown error";
            toast.error(t`Failed to delete group: ${message}`);
        },
        onSettled: (_res, _err, groupId: string) => {
            setGroupIsDeleting(groupId, false);
        },
    });

    const [isConfirming, setIsConfirming] = useState<boolean>(false);

    const handleModalConfirm = useCallback(async () => {
        if (!group || isConfirming) return;
        setIsConfirming(true);
        onClose();
        await deleteGroupMutation.mutateAsync(group.id);
        setIsConfirming(false);
    }, [group, isConfirming]);

    if (!group) return null;

    return (
        <Modal
            backdrop="transparent"
            isOpen={isOpen}
            onClose={onClose}
            classNames={{
                base: "select-none",
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 text-danger-400">
                    <Trans>Delete Firewall Group</Trans>
                </ModalHeader>
                <ModalBody>
                    <p>
                        <Trans>
                            Are you sure you want to delete this firewall group?
                        </Trans>
                    </p>
                    <div className="text-warning">
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
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        onPress={handleModalConfirm}
                        isLoading={isConfirming}
                    >
                        <Trans>Confirm</Trans>
                    </Button>
                    <Button color="danger" variant="light" onPress={onClose}>
                        <Trans>Cancel</Trans>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
