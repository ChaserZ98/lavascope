import { Button, Tooltip } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { mdiTrashCan } from "@mdi/js";
import Icon from "@mdi/react";

export default function DeleteButtonCell({
    isDisabled = false,
    isLoading = false,
    onDelete,
}: {
    isDisabled: boolean;
    isLoading: boolean;
    onDelete: () => void;
}) {
    const { t } = useLingui();

    return (
        <div className="flex w-full h-full items-center justify-center py-1">
            <Tooltip
                delay={500}
                closeDelay={150}
                content={t`Delete Rule`}
                color="danger"
                size="sm"
            >
                <Button
                    isLoading={isLoading}
                    isDisabled={isDisabled}
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    className="text-default-400 transition-colors-opacity hover:text-danger-400"
                    onPress={onDelete}
                >
                    <Icon path={mdiTrashCan} size={0.75} />
                </Button>
            </Tooltip>
        </div>
    );
}
