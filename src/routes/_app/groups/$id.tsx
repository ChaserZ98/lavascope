import { Button, Tab, Tabs, useDisclosure } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { selectAtom } from "jotai/utils";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import DeleteRuleModal from "@/components/Firewall/Rules/DeleteRuleModal";
import GroupInfo from "@/components/Firewall/Rules/GroupInfo";
import RulesTable from "@/components/Firewall/Rules/RulesTable";
import ProxySwitch from "@/components/ProxySwitch";
import { useVultrAPI } from "@/hooks/vultr";
import { ErrorResponse, RequestError } from "@/lib/vultr";
import { Rule, rulesAtom } from "@/store/firewall";
import { Version as IPVersion } from "@/store/ip";
import { Screen, screenSizeAtom } from "@/store/screen";
import logging from "@/utils/log";

export const Route = createFileRoute("/_app/groups/$id")({
    component: Rules,
});

function Rules() {
    const { id: groupId = "" } = Route.useParams();

    const navigate = useNavigate();

    const vultrAPI = useVultrAPI();

    const { t } = useLingui();

    const deleteModal = useDisclosure();

    const rulesQuery = useQuery({
        queryKey: ["rules", groupId],
        staleTime: 1000 * 30, // 30 seconds
        queryFn: async () =>
            await vultrAPI.firewall.listRules({ "firewall-group-id": groupId }),
        select: (data) => data.firewall_rules,
    });

    const screenSize = useAtomValue(screenSizeAtom);
    const rulesState = useAtomValue(
        selectAtom(
            rulesAtom,
            useCallback((state) => state[groupId] || {}, [groupId])
        )
    );

    const setRules = useSetAtom(rulesAtom);

    const [selectedRule, setSelectedRule] = useState<Rule | null>(null);

    const rulesIsLoading = rulesQuery.isFetching;
    const ipv4Rules = Object.values(rulesState).filter(
        (state) => state.rule.ip_type === IPVersion.V4
    );
    const ipv6Rules = Object.values(rulesState).filter(
        (state) => state.rule.ip_type === IPVersion.V6
    );

    const handleModalClose = useCallback(() => {
        deleteModal.onClose();
    }, []);

    const handleRefresh = useCallback(async () => {
        await rulesQuery.refetch();
    }, []);
    const onRuleDelete = useCallback((rule: Rule) => {
        setSelectedRule(rule);
        deleteModal.onOpen();
    }, []);

    useEffect(() => {
        if (rulesQuery.isError) {
            const error = rulesQuery.error;
            if (error instanceof ErrorResponse) {
                if (error.statusCode === 404) {
                    logging.warn(
                        `Failed to fetch firewall rules for group ${groupId}: ${error}`
                    );
                    toast.error(t`Group with ID ${groupId} not found`);
                    navigate({
                        to: "/",
                    });
                    return;
                }
                logging.error(
                    `Failed to fetch firewall rules for group ${groupId}: ${rulesQuery.error}`
                );
                const message = rulesQuery.error.message;
                toast.error(t`Failed to fetch rules: ${message}`);
                return;
            }
            if (error instanceof RequestError) {
                logging.error(
                    `Failed to fetch firewall rules for group ${groupId}: ${rulesQuery.error}`
                );
                const message = rulesQuery.error.message;
                toast.error(t`Failed to fetch rules: ${message}`);
                return;
            }
            logging.error(
                `Failed to fetch firewall rules for group ${groupId}: ${rulesQuery.error}`
            );
            const message = error.message || "Unknown error";
            toast.error(t`Failed to fetch rules: ${message}`);
        }
    }, [rulesQuery.isError]);

    useEffect(() => {
        const data = rulesQuery.data || [];
        setRules((state) => {
            data.forEach((rule) => {
                if (!state[groupId]) {
                    state[groupId] = {};
                }
                if (!state[groupId][rule.id.toString()]) {
                    state[groupId][rule.id.toString()] = {
                        rule: rule as Rule,
                        isDeleting: false,
                    };
                } else {
                    state[groupId][rule.id.toString()].rule = rule as Rule;
                }
            });
            Object.keys(state[groupId]).forEach((key) => {
                if (!data.find((rule) => rule.id.toString() === key)) {
                    delete state[groupId][key];
                }
            });
        });
    }, [rulesQuery.data]);

    return (
        <div className="flex flex-col px-8 pb-4 gap-4 items-center select-none">
            <h2 className="text-lg font-bold text-foreground transition-colors-opacity md:text-2xl">
                <Trans>Edit Firewall Group</Trans>
            </h2>
            <GroupInfo groupId={groupId} />
            <div className="flex flex-col w-full relative bg-content1 p-4 overflow-auto rounded-large shadow-small shadow-content1 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow] ease-[ease] duration-250 max-w-fit min-h-60">
                <Tabs
                    aria-label="Options"
                    isVertical={screenSize === Screen.SM ? false : true}
                    color="primary"
                    radius="lg"
                    size={screenSize === Screen.SM ? "sm" : "md"}
                    variant="solid"
                    classNames={{
                        base: "flex justify-center md:px-2",
                        tabList:
                            "transition-colors-opacity bg-content2 my-auto",
                        cursor: "transition-colors-opacity",
                        tab: "transition-colors-opacity",
                        panel: "overflow-auto md:px-0",
                    }}
                >
                    <Tab key="IPv4" title="IPv4">
                        <RulesTable
                            ipVersion={IPVersion.V4}
                            rules={ipv4Rules}
                            isLoading={rulesIsLoading}
                            onRuleDelete={onRuleDelete}
                        />
                    </Tab>
                    <Tab key="IPv6" title="IPv6">
                        <RulesTable
                            ipVersion={IPVersion.V6}
                            rules={ipv6Rules}
                            isLoading={rulesIsLoading}
                            onRuleDelete={onRuleDelete}
                        />
                    </Tab>
                </Tabs>
                <DeleteRuleModal
                    isOpen={deleteModal.isOpen}
                    rule={selectedRule}
                    groupId={groupId}
                    onClose={handleModalClose}
                />
            </div>
            <div className="flex gap-4 justify-center items-center flex-wrap">
                <Button onPress={handleRefresh} isLoading={rulesIsLoading}>
                    <Trans>Refresh</Trans>
                </Button>
                <ProxySwitch />
            </div>
        </div>
    );
}
