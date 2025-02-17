import {
    Button,
    Divider,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Tab,
    Tabs,
    Tooltip,
    useDisclosure,
} from "@heroui/react";
import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";

import RulesTable from "@/components/Firewall/Rules/RulesTable";
import ProxySwitch from "@/components/ProxySwitch";
import useFetch from "@/hooks/fetch";
import { firewallAtom } from "@/store/firewall/firewall";
import { groupAtom } from "@/store/firewall/groups";
import {
    CreateRule,
    createRuleAPI,
    deleteRuleAPI,
    initialNewRuleIPv4,
    initialNewRuleIPv6,
    NewRuleState,
    newRuleStateToCreateRule,
    protocolPortToDisplayProtocol,
    refreshingAtom,
    refreshRulesAPI,
    RuleInfo,
    rulesAtom,
    RulesMeta,
    RuleState,
    setNewRuleAtom,
} from "@/store/firewall/rules";
import { Version as IPVersion } from "@/store/ip";
import { languageAtom } from "@/store/language";
import { Screen, screenSizeAtom } from "@/store/screen";
import { apiTokenAtom, proxyAddressAtom, useProxyAtom } from "@/store/settings";
import logging from "@/utils/log";

export const Route = createFileRoute("/groups/$id")({
    component: Rules,
});

function RelativeTime({ date }: { date: string }) {
    const now = new Date();
    const then = new Date(date);

    const diff = Math.round((now.getTime() - then.getTime()) / 1000);
    if (diff < 60) return <Trans>Just now</Trans>;
    if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return (
            <Plural value={minutes} one="# minute ago" other="# minutes ago" />
        );
    }
    if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return <Plural value={hours} one="# hour ago" other="# hours ago" />;
    }
    if (diff < 604800) {
        const days = Math.floor(diff / 86400);
        return <Plural value={days} one="# day ago" other="# days ago" />;
    }
    if (diff < 2592000) {
        const weeks = Math.floor(diff / 604800);
        return <Plural value={weeks} one="# week ago" other="# weeks ago" />;
    }
    if (diff < 31536000) {
        const months = Math.floor(diff / 2592000);
        return <Plural value={months} one="# month ago" other="# months ago" />;
    }
    const years = Math.floor(diff / 31536000);
    return <Plural value={years} one="# year ago" other="# years ago" />;
}

function DeleteModal({
    modal,
    rule,
    onClose,
    onConfirm,
}: {
    modal: ReturnType<typeof useDisclosure>;
    rule: RuleState;
    onClose?: () => void;
    onConfirm?: (() => void) | ((onClose: () => void) => void);
}) {
    return (
        <Modal
            backdrop="transparent"
            isOpen={modal.isOpen}
            onClose={onClose}
            classNames={{
                base: "select-none",
            }}
        >
            <ModalContent>
                {(onModalClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 text-danger-400">
                            <Trans>Delete Firewall Rule</Trans>
                        </ModalHeader>
                        <ModalBody>
                            <p>
                                <Trans>
                                    Are you sure you want to delete this rule?
                                </Trans>
                            </p>
                            <div className="text-warning">
                                <p>
                                    <span>
                                        <Trans>IP Version: </Trans>
                                    </span>
                                    <span className="font-mono">
                                        {rule.ip_type === IPVersion.V4
                                            ? "IPv4"
                                            : "IPv6"}
                                    </span>
                                </p>
                                <p>
                                    <span>
                                        <Trans>Protocol: </Trans>
                                    </span>
                                    <span className="font-mono uppercase">
                                        {protocolPortToDisplayProtocol(
                                            rule.protocol,
                                            rule.port
                                        )}
                                    </span>
                                </p>
                                <p>
                                    <span>
                                        <Trans>Port: </Trans>
                                    </span>
                                    <span className="font-mono">
                                        {rule.port}
                                    </span>
                                </p>
                                <p>
                                    <span>
                                        <Trans>Source Type: </Trans>
                                    </span>
                                    <span className="font-mono capitalize">
                                        {rule.source}
                                    </span>
                                </p>
                                <p>
                                    <span>
                                        <Trans>Source Address: </Trans>
                                    </span>
                                    <span className="font-mono">
                                        {`${rule.subnet}/${rule.subnet_size}`}
                                    </span>
                                </p>
                                <p>
                                    <span>
                                        <Trans>Notes: </Trans>
                                    </span>
                                    <span className="font-mono">
                                        {rule.notes}
                                    </span>
                                </p>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color="primary"
                                isLoading={rule.deleting}
                                onPress={() =>
                                    onConfirm && onConfirm(onModalClose)
                                }
                            >
                                <Trans>Confirm</Trans>
                            </Button>
                            <Button
                                color="danger"
                                variant="light"
                                onPress={onClose}
                            >
                                <Trans>Cancel</Trans>
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

function Rules() {
    const { id = "" } = Route.useParams();

    const navigate = useNavigate();

    const screenSize = useAtomValue(screenSizeAtom);
    const apiToken = useAtomValue(apiTokenAtom);
    const proxyAddress = useAtomValue(proxyAddressAtom);
    const useProxy = useAtomValue(useProxyAtom);
    const group = useAtomValue(groupAtom(id));
    const rules = useAtomValue(rulesAtom(id));
    const refreshing = useAtomValue(refreshingAtom(id));
    const language = useAtomValue(languageAtom);

    const setFirewall = useSetAtom(firewallAtom);
    const setNewRule = useSetAtom(setNewRuleAtom);

    const fetchClient = useFetch(
        useProxy
            ? {
                  proxy: {
                      http: proxyAddress,
                      https: proxyAddress,
                  },
              }
            : undefined
    );

    const deleteModal = useDisclosure();

    const { t } = useLingui();

    const selectedRule = useRef<RuleState | null>(null);
    const deleteTimeoutId = useRef<NodeJS.Timeout | null>(null);

    const refresh = useCallback(
        (
            id: string,
            apiToken: string,
            fetchClient: typeof fetch,
            timeout: number = 5000
        ) => {
            if (!id) {
                toast.error(t`Empty group ID`);
                return;
            }
            logging.info(`Fetching rules for group ${id}.`);
            setFirewall((state) => {
                state.groups[id].refreshing = true;
            });

            const timeoutSignal = AbortSignal.timeout(timeout);
            refreshRulesAPI(id, apiToken, fetchClient, timeoutSignal)
                .then(async (res) => {
                    return {
                        status: res.status,
                        statusText: res.statusText,
                        data: await res.json(),
                    };
                })
                .then((res) => {
                    if (res.status < 400) {
                        const {
                            firewall_rules,
                            meta,
                        }: {
                            firewall_rules: RuleInfo[];
                            meta: RulesMeta;
                        } = res.data;
                        setFirewall((state) => {
                            state.groups[id].meta = meta;
                            state.groups[id].rules = firewall_rules.reduce(
                                (acc, rule) => {
                                    acc[rule.id] = {
                                        ...rule,
                                        deleting: false,
                                    };
                                    return acc;
                                },
                                {} as Record<number, RuleState>
                            );
                        });
                        logging.info(
                            `Successfully fetched ${meta.total} rules for group ${id}.`
                        );
                    } else if (res.status < 500)
                        throw new Error(
                            `${res.status} ${
                                res.data.error ? res.data.error : res.statusText
                            }`
                        );
                    else throw new Error(`${res.status} ${res.statusText}`);
                })
                .catch((err: Error) => {
                    logging.error(
                        `Failed to fetch firewall rules for group ${id}: ${
                            timeoutSignal.aborted ? timeoutSignal.reason : err
                        }`
                    );
                    const reason = timeoutSignal.aborted
                        ? timeoutSignal.reason.message
                        : err.message;
                    toast.error(
                        `Failed to fetch firewall rules for group ${id}: ${reason}`
                    );
                    setFirewall((state) => {
                        state.groups[id].rules = {};
                        state.groups[id].meta = null;
                    });
                })
                .finally(() => {
                    setFirewall((state) => {
                        state.groups[id].refreshing = false;
                    });
                });
        },
        []
    );
    const deleteRule = useCallback(
        async (
            groupId: string,
            ruleId: number,
            apiToken: string,
            fetchClient: typeof fetch,
            timeout: number = 5000
        ) => {
            logging.info(`Deleting the rule ${ruleId} in group ${groupId}.`);
            setFirewall((state) => {
                state.groups[groupId].rules[ruleId].deleting = true;
            });

            const timeoutSignal = AbortSignal.timeout(timeout);

            await deleteRuleAPI(
                groupId,
                ruleId,
                apiToken,
                fetchClient,
                timeoutSignal
            )
                .then(async (res) => {
                    if (!res.ok) {
                        const data = await res.json();
                        throw new Error(
                            `${res.status} ${data.error ? data.error : res.statusText}`
                        );
                    }
                    setFirewall((state) => {
                        delete state.groups[groupId].rules[ruleId];
                    });
                    logging.info(
                        `Successfully deleted the rule ${ruleId} in group ${groupId}.`
                    );
                    toast.success(t`Successfully deleted the rule.`);
                })
                .catch((err: Error) => {
                    logging.error(
                        `Failed to delete firewall rule ${ruleId} in group ${groupId}: ${
                            timeoutSignal.aborted ? timeoutSignal.reason : err
                        }`
                    );
                    const reason = timeoutSignal.aborted
                        ? timeoutSignal.reason.message
                        : err.message;
                    toast.error(
                        t`Failed to delete the firewall rule: ${reason}`
                    );
                })
                .finally(() => {
                    setFirewall((state) => {
                        if (state.groups[groupId].rules[ruleId]) {
                            state.groups[groupId].rules[ruleId].deleting =
                                false;
                        }
                    });
                });
        },
        []
    );
    const createRule = useCallback(
        (
            groupId: string,
            newRule: CreateRule,
            apiToken: string,
            fetchClient: typeof fetch,
            timeout: number = 5000
        ) => {
            logging.info(
                `Creating a new rule ${JSON.stringify(
                    newRule
                )} in group ${groupId}.`
            );
            setFirewall((state) => {
                state.groups[groupId].newRule[newRule.ip_type].creating = true;
            });

            const timeoutSignal = AbortSignal.timeout(timeout);
            createRuleAPI(
                groupId,
                newRule,
                apiToken,
                fetchClient,
                timeoutSignal
            )
                .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) {
                        throw new Error(
                            `${res.status} ${
                                data.error ? data.error : res.statusText
                            }`
                        );
                    }

                    const rule = data.firewall_rule as RuleInfo;
                    setFirewall((state) => {
                        state.groups[groupId].rules[rule.id] = {
                            ...rule,
                            deleting: false,
                        };
                        state.groups[groupId].newRule[newRule.ip_type] =
                            newRule.ip_type === IPVersion.V4
                                ? initialNewRuleIPv4
                                : initialNewRuleIPv6;
                    });

                    logging.info(
                        `Successfully created the rule ${JSON.stringify(
                            data
                        )} in group ${groupId}.`
                    );
                    toast.success(t`Successfully created the rule.`);
                })
                .catch((err: Error) => {
                    logging.error(
                        `Failed to create the rule ${JSON.stringify(
                            newRule
                        )} in group ${groupId}: ${
                            timeoutSignal.aborted ? timeoutSignal.reason : err
                        }`
                    );

                    const reason = timeoutSignal.aborted
                        ? timeoutSignal.reason.message
                        : err.message;
                    toast.error(t`Failed to create the rule: ${reason}`);
                })
                .finally(() => {
                    setFirewall((state) => {
                        state.groups[groupId].newRule[
                            newRule.ip_type
                        ].creating = false;
                    });
                });
        },
        []
    );
    const onRuleDelete = useCallback((rule: RuleState) => {
        if (deleteTimeoutId.current) clearTimeout(deleteTimeoutId.current);
        selectedRule.current = rule;
        deleteModal.onOpen();
    }, []);
    const onRuleCreate = useCallback(
        (rule: NewRuleState) => {
            const newRule = newRuleStateToCreateRule(rule);
            createRule(group.id, newRule, apiToken, fetchClient);
        },
        [fetchClient, apiToken]
    );
    const onRuleChange = useCallback((rule: NewRuleState) => {
        setNewRule(group.id, rule);
    }, []);

    if (!group) {
        logging.warn(`Group with ID ${id} not found`);
        toast.error(t`Group with ID ${id} not found`);
        navigate({
            to: "/",
        });
        return;
    }

    useEffect(() => {
        if (!group.id) {
            logging.warn(`Group with ID ${id} not found`);
            toast.error(t`Group with ID ${id} not found`);
            navigate({
                to: "/",
            });
            return;
        }
        if (group.id && group.meta === undefined)
            refresh(group.id, apiToken, fetchClient);
    }, [group, fetchClient, apiToken]);

    return (
        <div className="flex flex-col px-8 pb-4 gap-4 items-center select-none">
            <h2 className="text-lg font-bold text-foreground transition-colors-opacity md:text-2xl">
                <Trans>Edit Firewall Group</Trans>
            </h2>
            <div className="flex w-full items-center justify-center gap-4">
                <div className="text-xs md:text-sm">
                    <span>
                        <Trans>Group ID: </Trans>
                    </span>
                    <span className="font-bold font-mono">{id}</span>
                </div>
                <div className="text-xs md:text-sm">
                    <span>
                        <Trans>Created: </Trans>
                    </span>
                    <Tooltip
                        content={<RelativeTime date={group.date_created} />}
                        delay={2000}
                        closeDelay={500}
                    >
                        <span className="font-mono">
                            {new Date(group.date_created).toLocaleString(
                                language,
                                {
                                    timeZoneName: "short",
                                    hour12: false,
                                }
                            )}
                        </span>
                    </Tooltip>
                </div>
                <div className="text-xs md:text-sm">
                    <span>
                        <Trans>Last Modified: </Trans>
                    </span>
                    <Tooltip
                        content={<RelativeTime date={group.date_created} />}
                        delay={2000}
                        closeDelay={500}
                    >
                        <span className="font-mono">
                            {new Date(group.date_created).toLocaleString(
                                language,
                                {
                                    timeZoneName: "short",
                                    hour12: false,
                                }
                            )}
                        </span>
                    </Tooltip>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex flex-col gap-2 items-center">
                    <p className="text-default-400 text-sm md:text-base">
                        <Trans>Description</Trans>
                    </p>
                    <p className="font-mono text-sm md:text-base">
                        {group.description ? (
                            group.description
                        ) : (
                            <Trans>[Empty]</Trans>
                        )}
                    </p>
                </div>
                <Divider
                    orientation="vertical"
                    className="h-auto self-stretch bg-default-400"
                />
                <div className="flex flex-col gap-2 items-center">
                    <p className="text-default-400 text-sm md:text-base">
                        <Trans>Group Rules</Trans>
                    </p>
                    <p className="font-mono text-sm md:text-base">
                        <span>{group.rule_count}</span>
                        <span>/</span>
                        <span>{group.max_rule_count}</span>
                    </p>
                </div>
                <Divider
                    orientation="vertical"
                    className="h-auto self-stretch bg-default-400"
                />
                <div className="flex flex-col gap-2 items-center">
                    <p className="text-default-400 text-sm  md:text-base">
                        <Trans>Linked Instances</Trans>
                    </p>
                    <p className="font-mono text-sm md:text-base">
                        {group.instance_count}
                    </p>
                </div>
            </div>
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
                            rules={Object.values(rules).filter(
                                (rule) => rule.ip_type === IPVersion.V4
                            )}
                            newRule={group.newRule[IPVersion.V4]}
                            refreshing={group.refreshing}
                            onRuleDelete={onRuleDelete}
                            onRuleCreate={onRuleCreate}
                            onRuleChange={onRuleChange}
                        />
                    </Tab>
                    <Tab key="IPv6" title="IPv6">
                        <RulesTable
                            ipVersion={IPVersion.V6}
                            rules={Object.values(rules).filter(
                                (rule) => rule.ip_type === IPVersion.V6
                            )}
                            newRule={group.newRule[IPVersion.V6]}
                            refreshing={group.refreshing}
                            onRuleDelete={onRuleDelete}
                            onRuleCreate={onRuleCreate}
                            onRuleChange={onRuleChange}
                        />
                    </Tab>
                </Tabs>
                <DeleteModal
                    modal={deleteModal}
                    rule={selectedRule.current!}
                    onClose={() => {
                        deleteTimeoutId.current = setTimeout(() => {
                            selectedRule.current = null;
                        }, 1500);
                        deleteModal.onClose();
                    }}
                    onConfirm={(onClose) => {
                        if (!selectedRule.current) {
                            logging.warn(
                                `Delete rule operation failed: Rule ID is null`
                            );
                            toast.error(
                                t`Delete rule operation failed: Rule ID is null`
                            );
                            return;
                        }
                        selectedRule.current.deleting = true;
                        deleteRule(
                            group.id,
                            selectedRule.current.id,
                            apiToken,
                            fetchClient
                        ).finally(() => onClose());
                    }}
                />
            </div>
            <div className="flex gap-4 justify-center items-center flex-wrap">
                <Button
                    onPress={() => refresh(id, apiToken, fetchClient)}
                    isLoading={refreshing}
                >
                    <Trans>Refresh</Trans>
                </Button>
                <ProxySwitch />
            </div>
        </div>
    );
}
