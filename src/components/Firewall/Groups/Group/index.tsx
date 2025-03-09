import { Button, Textarea, Tooltip } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { mdiCheck, mdiRestart, mdiShieldEdit, mdiTrashCan } from "@mdi/js";
import Icon from "@mdi/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { selectAtom } from "jotai/utils";
import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";

import { useVultrAPI } from "@/hooks/vultr";
import { IListGroupsResponse } from "@/lib/vultr/api/firewall";
import {
    groupsStateAtom,
    setGroupIsUpdatingAtom,
    setNewDescriptionAtom,
} from "@/store/firewall";
import logging from "@/utils/log";

function IdCell({ value }: { value: string }) {
    return <>{value}</>;
}

function DescriptionCell({
    groupId,
    description,
    isDisabled,
}: {
    groupId: string;
    description: string;
    isDisabled?: boolean;
}) {
    const { t } = useLingui();

    const newDescription = useAtomValue(
        selectAtom(
            groupsStateAtom,
            useCallback((state) => state[groupId]?.newDescription, [groupId])
        )
    );
    const isLoading = useAtomValue(
        selectAtom(
            groupsStateAtom,
            useCallback(
                (state) => {
                    if (!state[groupId]) return false;
                    const group = state[groupId];
                    return group.isUpdating || group.isDeleting;
                },
                [groupId]
            )
        )
    );

    const setNewDescription = useSetAtom(setNewDescriptionAtom);
    const handleReset = useCallback(() => {
        setNewDescription(groupId, description);
    }, [description]);

    const isActionDisabled = isDisabled || isLoading;

    useEffect(() => {
        if (isDisabled) setNewDescription(groupId, description);
    }, [isDisabled]);

    return (
        <div className="flex gap-1">
            <Textarea
                isDisabled={isDisabled}
                minRows={1}
                variant="faded"
                placeholder={t`Enter note here`}
                value={newDescription}
                classNames={{
                    base: "min-w-[120px] max-w-[150px]",
                    inputWrapper:
                        "px-2 transition-colors-opacity !duration-250",
                    innerWrapper: "h-full",
                    input: "resize-none overflow-y-auto h-5 text-balance text-foreground !ease-[ease] !duration-250 !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity] placeholder:transition-colors-opacity",
                }}
                onChange={(e) => setNewDescription(groupId, e.target.value)}
            />
            <Tooltip
                content={t`Reset`}
                delay={1000}
                closeDelay={100}
                isDisabled={isActionDisabled || newDescription === description}
                color="default"
            >
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="default"
                    className="mt-1 text-default-400 transition-colors-opacity"
                    onPress={handleReset}
                    isDisabled={
                        isActionDisabled || newDescription === description
                    }
                >
                    <Icon path={mdiRestart} size={0.75} />
                </Button>
            </Tooltip>
        </div>
    );
}

function DateCreatedCell({ value }: { value: string }) {
    return (
        <>
            {new Date(value).toLocaleString(
                Intl.DateTimeFormat().resolvedOptions().locale,
                {
                    timeZoneName: "short",
                    hour12: false,
                }
            )}
        </>
    );
}

function LastModifiedDateCell({ value }: { value: string }) {
    return (
        <>
            {new Date(value).toLocaleString(
                Intl.DateTimeFormat().resolvedOptions().locale,
                {
                    timeZoneName: "short",
                    hour12: false,
                }
            )}
        </>
    );
}

function RuleCountCell({ value }: { value: number }) {
    return <>{value}</>;
}

function InstanceCountCell({ value }: { value: number }) {
    return <>{value}</>;
}

function ActionCell({
    groupId,
    description,
    isDisabled,
    onDelete,
}: {
    groupId: string;
    description: string;
    isDisabled?: boolean;
    onDelete: () => void;
}) {
    const { t } = useLingui();

    const queryClient = useQueryClient();

    const vultrAPI = useVultrAPI();

    const newDescription = useAtomValue(
        selectAtom(
            groupsStateAtom,
            useCallback(
                (state) => state[groupId]?.newDescription ?? description,
                [groupId]
            )
        )
    );
    const isUpdating = useAtomValue(
        selectAtom(
            groupsStateAtom,
            useCallback((state) => state[groupId]?.isUpdating, [groupId])
        )
    );
    const isDeleting = useAtomValue(
        selectAtom(
            groupsStateAtom,
            useCallback((state) => state[groupId]?.isDeleting, [groupId])
        )
    );

    const setGroupIsUpdating = useSetAtom(setGroupIsUpdatingAtom);

    const updateGroupMutation = useMutation<
        void,
        Error,
        {
            groupId: string;
            description: string;
        }
    >({
        mutationFn: async ({ groupId, description }) =>
            await vultrAPI.firewall.updateGroup({
                "firewall-group-id": groupId,
                description,
            }),
        onMutate: async ({ groupId, description }) => {
            setGroupIsUpdating(groupId, true);
            await queryClient.cancelQueries({
                queryKey: ["groups"],
            });
            const previousGroupsState =
                queryClient.getQueryData<IListGroupsResponse>(["groups"]);
            const newGroupsState = {
                ...previousGroupsState,
                firewall_groups: previousGroupsState?.firewall_groups.map(
                    (group) => {
                        if (group.id === groupId) {
                            return {
                                ...group,
                                description,
                            };
                        }
                        return group;
                    }
                ),
            };
            queryClient.setQueryData(["groups"], newGroupsState);
            return { previousGroupsState };
        },
        onSuccess: async (_, { groupId }) => {
            logging.info(`Successfully updated group with ID ${groupId}`);
            toast.success(t`Successfully updated group with ID ${groupId}`);
            await queryClient.invalidateQueries({
                queryKey: ["groups"],
            });
        },
        onError: (err, _, context) => {
            const typedContext = context as {
                previousGroupsState: IListGroupsResponse;
            };
            queryClient.setQueryData(
                ["groups"],
                typedContext.previousGroupsState
            );
            logging.error(`Failed to update group: ${err}`);
            const message = err.message || "unknown error";
            toast.error(t`Failed to update group: ${message}`);
        },
        onSettled: (_res, _err, { groupId }: { groupId: string }) => {
            setGroupIsUpdating(groupId, false);
        },
    });

    const handleConfirm = useCallback(
        async (groupId: string, description: string) => {
            await updateGroupMutation.mutateAsync({ groupId, description });
        },
        []
    );

    const isActionDisabled = isDisabled || isUpdating || isDeleting;

    return (
        <div className="flex w-24 items-center justify-end">
            <Tooltip
                content={t`Confirm`}
                delay={1000}
                closeDelay={100}
                isDisabled={isActionDisabled || newDescription === description}
                color="success"
            >
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="success"
                    className="text-default-400 transition-colors-opacity hover:text-success-400"
                    onPress={() => handleConfirm(groupId, newDescription)}
                    isDisabled={
                        isActionDisabled || newDescription === description
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
                isDisabled={isActionDisabled}
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
                    isDisabled={isActionDisabled}
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
                isDisabled={isActionDisabled}
                color="danger"
            >
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    className="text-default-400 transition-colors-opacity hover:text-danger-400"
                    onPress={onDelete}
                    isDisabled={isActionDisabled}
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
