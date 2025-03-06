import { Input } from "@heroui/react";

import { NewRuleState, Protocol } from "@/store/firewall";

export default function PortCell({
    isDisabled,
    newRule,
    onRuleChange,
}: {
    isDisabled?: boolean;
    newRule: NewRuleState;
    onRuleChange: (rule: NewRuleState) => void;
}) {
    return (
        <Input
            placeholder="Port"
            aria-label="Port"
            variant="faded"
            isDisabled={
                isDisabled ||
                (newRule.protocol !== Protocol.TCP &&
                    newRule.protocol !== Protocol.UDP) ||
                newRule.creating
            }
            value={newRule.port}
            onChange={(e) =>
                e.target.value.match(/^[0-9]{0,5}$/)
                    ? onRuleChange({
                          ...newRule,
                          port: e.target.value,
                      })
                    : e.preventDefault()
            }
            classNames={{
                base: "min-w-[80px]",
                inputWrapper: "transition-colors-opacity !duration-250",
                input: "text-foreground transition-colors-opacity",
            }}
        />
    );
}
