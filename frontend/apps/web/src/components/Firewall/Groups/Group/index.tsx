import { Button } from "@lavascope/ui/components/ui/button";
import { Textarea } from "@lavascope/ui/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@lavascope/ui/components/ui/tooltip";
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
                disabled={isDisabled}
                // minRows={1}
                // variant="faded"
                placeholder={t`Enter description here`}
                value={newDescription}
                // classNames={{
                //     base: "min-w-[120px] max-w-[150px] min-h-8",
                //     inputWrapper:
                //         "px-1.5 py-1 min-h-fit rounded-lg transition-colors-opacity !duration-250",
                //     input: "resize-none overflow-y-auto h-5 text-balance text-foreground !ease-[ease] !duration-250 !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity] placeholder:transition-colors-opacity",
                // }}
                onChange={(e) => setNewDescription(groupId, e.target.value)}
            />
            <Tooltip
                disableHoverableContent={isDisabled || newDescription === description}
                delayDuration={1000}
            >
                <TooltipTrigger asChild>
                    <Button
                        size="sm"
                        variant="default"
                        color="default"
                        className={`text-default-400 transition-colors-opacity ${newDescription === description ? "opacity-0" : ""}`}
                        onClick={handleReset}
                        disabled={isDisabled || newDescription === description}
                    >
                        <Icon path={mdiRestart} size={0.75} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {t`Reset`}
                </TooltipContent>
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
        (groupId: string, description: string) => {
            updateGroupMutation.mutate({ groupId, description });
        },
        []
    );

    return (
        <div className="flex w-24 items-center justify-end">
            <Tooltip
                delayDuration={1000}
                disableHoverableContent={isDisabled || newDescription === description}
            >
                <TooltipTrigger asChild>
                    <Button
                        size="sm"
                        variant="default"
                        color="success"
                        className={`text-default-400 transition-colors-opacity hover:text-success-400 ${newDescription === description && !isUpdating ? "opacity-0" : ""}`}
                        onClick={() => handleConfirm(groupId, newDescription)}
                        disabled={isDisabled || newDescription === description}
                    >
                        <Icon
                            path={mdiCheck}
                            size={0.75}
                            className="cursor-pointer"
                        />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {t`Confirm`}
                </TooltipContent>
            </Tooltip>
            <Tooltip
                delayDuration={1000}
                disableHoverableContent={isDisabled}
            >
                <TooltipTrigger asChild>
                    <Button
                        size="sm"
                        variant="default"
                        color="primary"
                        className="text-default-400 transition-colors-opacity hover:text-primary-400"
                        disabled={isDisabled}
                        asChild
                    >
                        <Link to="/groups/$id" params={{ id: groupId }}>
                            <Icon
                                path={mdiShieldEdit}
                                size={0.75}
                                className="cursor-pointer"
                            />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {t`Edit Rules`}
                </TooltipContent>
            </Tooltip>
            <Tooltip
                delayDuration={1000}
                disableHoverableContent={isDisabled}
            >
                <TooltipTrigger asChild>
                    <Button
                        size="sm"
                        variant="default"
                        color="danger"
                        className="text-default-400 transition-colors-opacity hover:text-danger-400"
                        onClick={onDelete}
                        disabled={isDisabled}
                    >
                        <Icon path={mdiTrashCan} size={0.75} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {t`Delete`}
                </TooltipContent>
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
