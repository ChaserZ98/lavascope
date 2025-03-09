import { Input } from "@heroui/react";
import { useParams } from "@tanstack/react-router";
import { useSetAtom } from "jotai";

import { NewRuleState, Protocol, setNewRuleAtom } from "@/store/firewall";

export default function PortCell({
    isDisabled,
    newRule,
}: {
    isDisabled?: boolean;
    newRule: NewRuleState;
}) {
    const { id: groupId = "" } = useParams({
        from: "/_app/groups/$id",
    });

    const setNewRule = useSetAtom(setNewRuleAtom);

    const isCreating = newRule.isCreating;
    const isActionDisabled = isDisabled || isCreating;
    return (
        <Input
            placeholder="Port"
            aria-label="Port"
            variant="faded"
            isDisabled={
                isActionDisabled ||
                (newRule.protocol !== Protocol.TCP &&
                    newRule.protocol !== Protocol.UDP)
            }
            value={newRule.port}
            onChange={(e) => {
                if (!e.target.value.match(/^[0-9]{0,5}$/)) {
                    e.preventDefault();
                    return;
                }
                const rule = {
                    ...newRule,
                    port: e.target.value,
                };
                setNewRule(groupId, rule);
            }}
            classNames={{
                base: "min-w-[80px]",
                inputWrapper: "transition-colors-opacity !duration-250",
                input: "text-foreground transition-colors-opacity",
            }}
        />
    );
}
