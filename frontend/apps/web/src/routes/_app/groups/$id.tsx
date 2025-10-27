import { GroupInfo, ProxySwitch, RulesTabs } from "@lavascope/ui/components/lavascope";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/groups/$id")({
    component: Rules,
});

function Rules() {
    const { id: groupId = "" } = Route.useParams();

    // const deleteModal = useDisclosure();

    // const rulesQuery = useRulesQuery(groupId);

    // const screenSize = useAtomValue(screenSizeAtom);
    // const rulesState = useAtomValue(
    //     selectAtom(
    //         VultrFirewall.rulesAtom,
    //         useCallback((state) => state[groupId] || {}, [groupId])
    //     )
    // );

    // const [selectedRule, setSelectedRule] = useState<VultrFirewall.Rule | null>(null);

    // const [isLoading, setIsLoading] = useState<boolean>(false);

    // const rulesIsLoading = rulesQuery.isFetching;
    // const ipv4Rules = Object.values(rulesState).filter(
    //     (state): state is VultrFirewall.RuleState =>
    //         state !== undefined && state.rule.ip_type === IPVersion.V4
    // );
    // const ipv6Rules = Object.values(rulesState).filter(
    //     (state): state is VultrFirewall.RuleState =>
    //         state !== undefined && state.rule.ip_type === IPVersion.V6
    // );

    // const handleRefresh = useCallback(async () => {
    //     setIsLoading(true);
    //     const res = await rulesQuery.refetch();
    //     if (res.isError) {
    //         const message = res.error instanceof Error ?
    //             res.error.message :
    //             res.error;
    //         toast.error(() => <Trans>Failed to fetch firewall rules</Trans>, { description: message });
    //     }
    //     setIsLoading(false);
    // }, []);
    // const onRuleDelete = useCallback((rule: VultrFirewall.Rule) => {
    //     setSelectedRule(rule);
    //     deleteModal.onOpen();
    // }, []);

    // return (
    //     <div className="flex flex-col px-8 pb-4 gap-4 items-center select-none">
    //         <h2 className="text-lg font-bold text-foreground transition-colors-opacity md:text-2xl">
    //             <Trans>Edit Firewall Group</Trans>
    //         </h2>
    //         <GroupInfo groupId={groupId} />
    //     </div>
    // );

    return (
        <div className="flex flex-col px-8 pb-4 gap-4 items-center select-none">
            <h2 className="text-lg font-bold text-foreground transition-colors-opacity md:text-2xl">
                <Trans>Edit Firewall Group</Trans>
            </h2>
            <GroupInfo groupId={groupId} />
            <RulesTabs groupId={groupId} />
            <div className="mx-auto">
                <ProxySwitch />
            </div>
        </div>
    );
}
