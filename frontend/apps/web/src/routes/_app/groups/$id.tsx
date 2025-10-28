import { VultrFirewall } from "@lavascope/store/firewlall";
import { GroupInfo, ProxySwitch, RulesTabs } from "@lavascope/ui/components/lavascope";
import { Trans } from "@lingui/react/macro";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { useMemo } from "react";

export const Route = createFileRoute("/_app/groups/$id")({
    component: Rules,
});

function Rules() {
    const { id: groupId = "" } = Route.useParams();

    const navigate = useNavigate();

    const groupAtom = useMemo(() => selectAtom(VultrFirewall.groupsStateAtom, (state) => state[groupId]?.group), []);
    const group = useAtomValue(groupAtom);

    if (!group) {
        return navigate({ to: "/groups", replace: true });
    }

    return (
        <div className="w-full space-y-4 select-none">
            <h2 className="text-center text-lg font-bold text-foreground transition-colors-opacity md:text-2xl">
                <Trans>Edit Firewall Group</Trans>
            </h2>
            <GroupInfo group={group} />
            <RulesTabs groupId={groupId} />
            <div className="mx-auto w-fit">
                <ProxySwitch />
            </div>
        </div>
    );
}
