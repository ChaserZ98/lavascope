import { Textarea } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";

import { NewRuleState } from "@/store/firewall";

export default function NotesCell({
    isDisabled,
    newRule,
    onRuleChange,
}: {
    isDisabled?: boolean;
    newRule: NewRuleState;
    onRuleChange: (rule: NewRuleState) => void;
}) {
    const { t } = useLingui();

    return (
        <Textarea
            isDisabled={isDisabled || newRule.creating}
            minRows={1}
            variant="faded"
            placeholder={t`Enter note here`}
            value={newRule.notes}
            classNames={{
                base: "min-w-[120px]",
                inputWrapper: "px-2 transition-colors-opacity !duration-250",
                innerWrapper: "h-full",
                input: "resize-none overflow-y-auto h-5 text-balance text-foreground !ease-[ease] !duration-250 !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity] placeholder:transition-colors-opacity placeholder:italic",
            }}
            onChange={(e) =>
                onRuleChange({
                    ...newRule,
                    notes: e.target.value,
                })
            }
        />
    );
}
