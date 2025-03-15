import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useCallback, useState } from "react";

import { useCreateGroupMutation } from "@/hooks/Firewall";

export default function CreateGroupModal({
    isOpen,
    onClose = () => {},
}: {
    isOpen: boolean;
    onClose?: () => void;
}) {
    const { t } = useLingui();

    const [description, setDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const createGroupMutation = useCreateGroupMutation();

    const handleModalConfirm = useCallback(async () => {
        if (isCreating) return;
        setIsCreating(true);
        createGroupMutation.mutate(description);
        onClose();
        setIsCreating(false);
        setDescription("");
    }, [description, isCreating]);

    return (
        <Modal
            backdrop="opaque"
            isOpen={isOpen}
            onClose={onClose}
            classNames={{
                base: "select-none",
            }}
            placement="center"
        >
            <ModalContent>
                <ModalHeader className="flex flex-col text-success-400">
                    <Trans>New Firewall Group</Trans>
                </ModalHeader>
                <ModalBody>
                    <Textarea
                        autoFocus
                        isDisabled={isCreating}
                        minRows={1}
                        variant="faded"
                        placeholder={t`Enter description here`}
                        value={description}
                        label={t`Description`}
                        labelPlacement="outside-left"
                        classNames={{
                            base: "min-w-[120px] max-w-[300px]",
                            inputWrapper: "pl-2 pr-8 py-2 min-h-8 transition-colors-opacity !duration-250",
                            innerWrapper: "h-full",
                            input: "resize-none overflow-y-auto h-5 text-balance text-foreground !ease-[ease] !duration-250 !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity] placeholder:transition-colors-opacity"
                        }}
                        isClearable
                        onChange={(e) => setDescription(e.target.value)}
                        onClear={() => setDescription("")}
                    />

                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        onPress={handleModalConfirm}
                        isLoading={isCreating}
                    >
                        <Trans>Create</Trans>
                    </Button>
                    <Button color="danger" variant="light" onPress={onClose}>
                        <Trans>Cancel</Trans>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
