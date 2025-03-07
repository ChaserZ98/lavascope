import { Button, Textarea, Tooltip } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { mdiCheck, mdiClose, mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";
import { useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

import { db } from "@/db";
import { useVultrAPI } from "@/hooks/vultr";
import { groupsAtom } from "@/store/firewall";

export default function DescriptionEdit({
    groupId,
    description,
}: {
    groupId: string;
    description: string;
}) {
    const setGroups = useSetAtom(groupsAtom);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [newDescription, setNewDescription] = useState<string>(description);

    const { t } = useLingui();
    const vultrAPI = useVultrAPI();

    const handleEdit = useCallback(() => {
        setNewDescription(value);
        setIsEditing(true);
    }, []);

    const handleConfirm = useCallback(async (description: string) => {
        setIsLoading(true);
        try {
            await vultrAPI.firewall.updateGroup({
                description,
                "firewall-group-id": groupId,
            });
            setIsEditing(false);
            await db.groups.bulkUpdate([
                {
                    key: groupId,
                    changes: {
                        description,
                    },
                },
            ]);
            setGroups((state) => {
                state[groupId].group.description = description;
            });
        } catch (e) {
            console.error(`Failed to update group description: ${e}`);
            const message = e instanceof Error ? e.message : t`Unknown error`;
            toast.error(t`Failed to update group description: ${message}`);
        } finally {
            setIsLoading(false);
        }
    }, []);
    const handleCancel = useCallback(() => {
        setNewDescription(value);
        setIsEditing(false);
    }, []);

    const value = isEditing
        ? newDescription
        : description
          ? description
          : t`[Empty]`;

    return (
        <div className="flex flex-col gap-2 items-center">
            <p className="text-default-400 text-sm md:text-base">
                <Trans>Description</Trans>
            </p>
            <div className="flex gap-2 items-center">
                <Textarea
                    isReadOnly={!isEditing}
                    minRows={1}
                    variant="faded"
                    placeholder={t`Enter note here`}
                    value={value}
                    classNames={{
                        base: "min-w-[120px] max-w-[150px]",
                        inputWrapper:
                            "px-2 transition-colors-opacity !duration-250",
                        innerWrapper: "h-full",
                        input: "resize-none overflow-y-auto h-5 font-mono text-sm text-balance text-foreground md:text-base !ease-[ease] !duration-250 !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity] placeholder:transition-colors-opacity placeholder:italic",
                    }}
                    onChange={(e) => setNewDescription(e.target.value)}
                />
                <div className="flex">
                    {isEditing ? (
                        <Tooltip
                            content={t`Confirm`}
                            delay={1000}
                            closeDelay={100}
                            isDisabled={newDescription === description}
                            color="primary"
                        >
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="primary"
                                className="text-default-400 transition-colors-opacity hover:text-default-800 hover:bg-primary"
                                onPress={() => handleConfirm(newDescription)}
                                isDisabled={newDescription === description}
                                isLoading={isLoading}
                            >
                                <Icon path={mdiCheck} size={0.75} />
                            </Button>
                        </Tooltip>
                    ) : (
                        <Tooltip
                            content={t`Edit`}
                            delay={1000}
                            closeDelay={100}
                            color="primary"
                        >
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="primary"
                                className="text-default-400 transition-colors-opacity hover:text-default-800 hover:bg-primary"
                                onPress={handleEdit}
                            >
                                <Icon path={mdiPencil} size={0.75} />
                            </Button>
                        </Tooltip>
                    )}
                    <Tooltip
                        content={t`Cancel`}
                        delay={1000}
                        closeDelay={100}
                        isDisabled={!isEditing}
                        color="warning"
                    >
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="text-default-400 transition-colors-opacity hover:text-default-800 hover:bg-warning"
                            onPress={handleCancel}
                            isDisabled={!isEditing}
                        >
                            <Icon path={mdiClose} size={0.75} />
                        </Button>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}
