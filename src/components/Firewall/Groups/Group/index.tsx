import { Button, Tooltip } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { mdiPencil, mdiTrashCan } from "@mdi/js";
import Icon from "@mdi/react";
import { Link } from "@tanstack/react-router";

function IdCell({ value }: { value: string }) {
    return <>{value}</>;
}

function DescriptionCell({ value }: { value: string }) {
    return <>{value}</>;
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
    id,
    isDisabled,
    onDelete,
}: {
    id: string;
    isDisabled: boolean;
    onDelete: () => void;
}) {
    const { t } = useLingui();

    return (
        <div className="flex w-24 items-center justify-end">
            <Tooltip
                content={t`Edit`}
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
                    to={`/groups/${id}`}
                    className="text-default-400 transition-colors-opacity hover:text-primary-400"
                    as={Link}
                >
                    <Icon
                        path={mdiPencil}
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
