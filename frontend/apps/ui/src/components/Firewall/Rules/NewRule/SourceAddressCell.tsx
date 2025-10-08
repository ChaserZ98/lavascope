import { Textarea } from "@heroui/react";
import { useParams } from "@tanstack/react-router";
import { useSetAtom } from "jotai";

import { type NewRuleState, setNewRuleAtom, SourceType } from "@/store/firewall";
import { Version as IPVersion } from "@/store/ip";

export default function SourceAddressCell({
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

    return (
        <Textarea
            isDisabled={
                isDisabled || newRule.sourceType !== SourceType.CUSTOM
            }
            minRows={1}
            maxRows={4}
            variant="faded"
            placeholder={
                newRule.ip_type === IPVersion.V4 ?
                    "x.x.x.x/xx" :
                    "x:x:x:x:x:x:x:x/xxx"
            }
            value={newRule.source}
            classNames={{
                base: "min-w-[150px]",
                inputWrapper: "px-2 transition-colors-opacity !duration-250",
                innerWrapper: "h-full",
                input: "resize-none h-5 text-foreground !ease-[ease] !duration-250 !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity] placeholder:transition-colors-opacity placeholder:italic",
            }}
            onChange={(e) => {
                setNewRule(groupId, {
                    ...newRule,
                    source: e.target.value,
                });
            }}
        />
    );
}
