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
import {
    deleteRuleAtom,
    Rule,
    setRuleIsDeletingAtom,
    toProtocolDisplay,
} from "@/store/firewall";
import { Version as IPVersion } from "@/store/ip";
import logging from "@/utils/log";

export default function DeleteRuleModal({
    isOpen,
    groupId,
    rule,
    onClose = () => {},
}: {
    isOpen?: boolean;
    groupId: string;
    rule: Rule | null;
    onClose?: () => void;
}) {
    const vultrAPI = useVultrAPI();

    const { t } = useLingui();

    const queryClient = useQueryClient();

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

    const [isConfirming, setIsConfirming] = useState<boolean>(false);

    const handleModalConfirm = useCallback(async () => {
        if (!rule || isConfirming) return;
        setIsConfirming(true);
        onClose();
        await deleteRuleMutation.mutateAsync({
            groupId,
            ruleId: rule.id.toString(),
        });
        setIsConfirming(false);
    }, [rule, isConfirming]);

    if (!rule) return null;

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
                    <Trans>Delete Firewall Rule</Trans>
                </ModalHeader>
                <ModalBody>
                    <p>
                        <Trans>
                            Are you sure you want to delete this rule?
                        </Trans>
                    </p>
                    <div className="text-warning">
                        <p>
                            <span>
                                <Trans>IP Version: </Trans>
                            </span>
                            <span className="font-mono">
                                {rule.ip_type === IPVersion.V4
                                    ? "IPv4"
                                    : "IPv6"}
                            </span>
                        </p>
                        <p>
                            <span>
                                <Trans>Protocol: </Trans>
                            </span>
                            <span className="font-mono uppercase">
                                {toProtocolDisplay(rule.protocol, rule.port)}
                            </span>
                        </p>
                        <p>
                            <span>
                                <Trans>Port: </Trans>
                            </span>
                            <span className="font-mono">{rule.port}</span>
                        </p>
                        <p>
                            <span>
                                <Trans>Source Type: </Trans>
                            </span>
                            <span className="font-mono capitalize">
                                {rule.source}
                            </span>
                        </p>
                        <p>
                            <span>
                                <Trans>Source Address: </Trans>
                            </span>
                            <span className="font-mono">
                                {`${rule.subnet}/${rule.subnet_size}`}
                            </span>
                        </p>
                        <p>
                            <span>
                                <Trans>Notes: </Trans>
                            </span>
                            <span className="font-mono">{rule.notes}</span>
                        </p>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onPress={handleModalConfirm}>
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
