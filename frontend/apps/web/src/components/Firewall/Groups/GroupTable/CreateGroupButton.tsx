import { Button, Tooltip } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";

export default function CreateGroupButton({ onPress }: { onPress: () => void }) {
    const { t } = useLingui();

    return (
        <Tooltip
            content={t`Create Group`}
            delay={1000}
            closeDelay={100}
            color="success"
        >
            <Button
                isIconOnly
                size="sm"
                variant="light"
                color="success"
                className="absolute right-0 text-sm bg-content2 text-content2-foreground transition-colors-opacity hover:text-success-400"
                onPress={onPress}
            >
                <Icon path={mdiPlus} size={0.75} />
            </Button>
        </Tooltip>
    );
}
