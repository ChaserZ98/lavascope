import { Button, Tooltip } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";

import { NewRuleState } from "@/store/firewall";

export default function AddButtonCell({
    newRule,
    onPress,
    isDisabled,
}: {
    newRule: NewRuleState;
    onPress: () => void;
    isDisabled?: boolean;
}) {
    const { t } = useLingui();

    return (
        <div className="flex w-full h-full items-center justify-center py-1">
            <Tooltip
                delay={500}
                closeDelay={150}
                content={t`Add Rule`}
                size="sm"
                color="primary"
            >
                <Button
                    isDisabled={isDisabled || newRule.creating}
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="primary"
                    className="text-default-400 transition-colors-opacity hover:text-primary-400"
                    onPress={onPress}
                    isLoading={newRule.creating}
                >
                    <Icon path={mdiPlus} size={0.75} />
                </Button>
            </Tooltip>
        </div>
    );
}
