import { Button, Textarea, Tooltip } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { mdiCheck, mdiRestart, mdiShieldEdit, mdiTrashCan } from "@mdi/js";
import Icon from "@mdi/react";
import { Link } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { selectAtom } from "jotai/utils";
import { useCallback, useEffect } from "react";

import { useUpdateGroupMutation } from "@/hooks/Firewall";
import { groupsStateAtom, setNewDescriptionAtom } from "@/store/firewall";

function IdCell({ groupId }: { groupId: string }) {
    return (
        <div>{groupId}</div>
    );
}

function DescriptionCell({
    groupId,
    description,
    newDescription,
    isDisabled,
}: {
    groupId: string;
    description: string;
    newDescription: string;
    isDisabled?: boolean;
}) {
    const { t } = useLingui();

    const setNewDescription = useSetAtom(setNewDescriptionAtom);

    const handleReset = useCallback(() => {
        setNewDescription(groupId, description);
    }, [description, groupId]);

    useEffect(() => {
        if (isDisabled) setNewDescription(groupId, description);
    }, [isDisabled, groupId]);

    return (
        <div className="flex gap-1">
            <Textarea
                isDisabled={isDisabled}
                minRows={1}
                variant="faded"
                placeholder={t`Enter description here`}
                value={newDescription}
                classNames={{
                    base: "min-w-[120px] max-w-[150px] min-h-8",
                    inputWrapper:
                        "px-1.5 py-1 min-h-fit rounded-lg transition-colors-opacity !duration-250",
                    input: "resize-none overflow-y-auto h-5 text-balance text-foreground !ease-[ease] !duration-250 !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity] placeholder:transition-colors-opacity",
                }}
                onChange={(e) => setNewDescription(groupId, e.target.value)}
            />
            <Tooltip
                content={t`Reset`}
                delay={1000}
                closeDelay={100}
                isDisabled={isDisabled || newDescription === description}
                color="default"
            >
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="default"
                    className={`text-default-400 transition-colors-opacity ${newDescription === description ? "opacity-0" : ""}`}
                    onPress={handleReset}
                    isDisabled={isDisabled || newDescription === description}
                >
                    <Icon path={mdiRestart} size={0.75} />
                </Button>
            </Tooltip>
        </div>
    );
}

function DateCreatedCell({ value }: { value: string }) {
    return (
        <div>
            {new Date(value).toLocaleString(
                Intl.DateTimeFormat().resolvedOptions().locale,
                {
                    timeZoneName: "short",
                    hour12: false,
                }
            )}
        </div>
    );
}

function LastModifiedDateCell({ value }: { value: string }) {
    return (
        <div>
            {new Date(value).toLocaleString(
                Intl.DateTimeFormat().resolvedOptions().locale,
                {
                    timeZoneName: "short",
                    hour12: false,
                }
            )}
        </div>
    );
}

function RuleCountCell({ value }: { value: number }) {
    return <div>{value}</div>;
}

function InstanceCountCell({ value }: { value: number }) {
    return <div>{value}</div>;
}

function ActionCell({
    groupId,
    description,
    isDisabled,
    isUpdating,
    isDeleting,
    onDelete,
}: {
    groupId: string;
    description: string;
    isDisabled?: boolean;
    isUpdating?: boolean;
    isDeleting?: boolean;
    onDelete: () => void;
}) {
    const { t } = useLingui();

    const newDescription = useAtomValue(
        selectAtom(
            groupsStateAtom,
            useCallback(
                (state) => state[groupId]?.newDescription ?? description,
                [groupId]
            )
        )
    );

    const updateGroupMutation = useUpdateGroupMutation();

    const handleConfirm = useCallback(
        async (groupId: string, description: string) => {
            await updateGroupMutation.mutateAsync({ groupId, description });
        },
        []
    );

    return (
        <div className="flex w-24 items-center justify-end">
            <Tooltip
                content={t`Confirm`}
                delay={1000}
                closeDelay={100}
                isDisabled={isDisabled || newDescription === description}
                color="success"
            >
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="success"
                    className={`text-default-400 transition-colors-opacity hover:text-success-400 ${newDescription === description && !isUpdating ? "opacity-0" : ""}`}
                    onPress={() => handleConfirm(groupId, newDescription)}
                    isDisabled={
                        isDisabled || newDescription === description
                    }
                    isLoading={isUpdating}
                >
                    <Icon
                        path={mdiCheck}
                        size={0.75}
                        className="cursor-pointer"
                    />
                </Button>
            </Tooltip>
            <Tooltip
                content={t`Edit Rules`}
                delay={1000}
                closeDelay={100}
                isDisabled={isDisabled}
                color="primary"
            >
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="primary"
                    to={`/groups/${groupId}`}
                    className="text-default-400 transition-colors-opacity hover:text-primary-400"
                    as={Link}
                    isDisabled={isDisabled}
                >
                    <Icon
                        path={mdiShieldEdit}
                        size={0.75}
                        className="cursor-pointer"
                    />
                </Button>
            </Tooltip>
            <Tooltip
                content={t`Delete`}
                delay={1000}
                closeDelay={100}
                isDisabled={isDisabled}
                color="danger"
            >
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    className="text-default-400 transition-colors-opacity hover:text-danger-400"
                    onPress={onDelete}
                    isDisabled={isDisabled}
                    isLoading={isDeleting}
                >
                    <Icon path={mdiTrashCan} size={0.75} />
                </Button>
            </Tooltip>
        </div>
    );
}

export default {
    IdCell,
    DescriptionCell,
    DateCreatedCell,
    RuleCountCell,
    InstanceCountCell,
    ActionCell,
    LastModifiedDateCell,
};
