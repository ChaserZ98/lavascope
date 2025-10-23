import { VultrFirewall } from "@lavascope/store/firewlall";
import { Textarea } from "@lavascope/ui/components/ui";
import { useLingui } from "@lingui/react/macro";
import { useParams } from "@tanstack/react-router";
import { useSetAtom } from "jotai";

export default function NotesCell({
    isDisabled,
    newRule,
}: {
    isDisabled?: boolean;
    newRule: VultrFirewall.NewRuleState;
}) {
    const { id: groupId = "" } = useParams({
        from: "/_app/groups/$id",
    });

    const { t } = useLingui();

    const setNewRule = useSetAtom(VultrFirewall.setNewRuleAtom);

    return (
        <Textarea
            disabled={isDisabled}
            // minRows={1}
            // variant="faded"
            placeholder={t`Enter note here`}
            value={newRule.notes}
            // classNames={{
            //     base: "min-w-[120px]",
            //     inputWrapper: "px-2 transition-colors-opacity !duration-250",
            //     innerWrapper: "h-full",
            //     input: "resize-none overflow-y-auto h-5 text-balance text-foreground !ease-[ease] !duration-250 !transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity] placeholder:transition-colors-opacity placeholder:italic",
            // }}
            onChange={
                (e) => setNewRule(groupId, { ...newRule, notes: e.target.value })
            }
        />
    );
}
