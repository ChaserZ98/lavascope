import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { useCallback, useState } from "react";

import { useDeleteRuleMutation } from "@/hooks/Firewall";
import { Rule, toProtocolDisplay } from "@/store/firewall";
import { Version as IPVersion } from "@/store/ip";

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
    const deleteRuleMutation = useDeleteRuleMutation();

    const [isConfirming, setIsConfirming] = useState<boolean>(false);

    const handleModalConfirm = useCallback(() => {
        if (!rule || isConfirming) return;
        setIsConfirming(true);
        onClose();
        setIsConfirming(false);
        deleteRuleMutation.mutate({
            groupId,
            ruleId: rule.id.toString(),
        });
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
                                {rule.ip_type === IPVersion.V4 ?
                                    "IPv4" :
                                    "IPv6"}
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
