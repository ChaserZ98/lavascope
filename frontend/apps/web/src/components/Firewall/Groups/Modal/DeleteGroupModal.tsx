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

import { useDeleteGroupMutation } from "@/hooks/Firewall";
import type { IFirewallGroup } from "@/lib/vultr/types";

export default function DeleteGroupModal({
    group,
    isOpen,
    onClose = () => {},
}: {
    group: IFirewallGroup | null;
    isOpen: boolean;
    onClose?: () => void;
}) {
    const deleteGroupMutation = useDeleteGroupMutation();

    const [isConfirming, setIsConfirming] = useState<boolean>(false);

    const handleModalConfirm = useCallback(() => {
        if (!group || isConfirming) return;
        setIsConfirming(true);
        onClose();
        setIsConfirming(false);
        deleteGroupMutation.mutate(group.id);
    }, [group, isConfirming]);

    if (!group) return null;

    return (
        <Modal
            backdrop="opaque"
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
