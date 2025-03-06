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
import Dexie from "dexie";
import { useAtomValue, useSetAtom } from "jotai";
import { selectAtom } from "jotai/utils";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import RulesTable from "@/components/Firewall/Rules/RulesTable";
import ProxySwitch from "@/components/ProxySwitch";
import { db } from "@/db";
import { useVultrAPI } from "@/hooks/vultr";
import {
    CreateRule,
    groupsAtom,
    initialNewRuleIPv4,
    initialNewRuleIPv6,
    NewRuleState,
    Rule,
    rulesAtom,
    setNewRuleAtom,
    toCreateRule,
    toProtocolDisplay,
} from "@/store/firewall";
import { Version as IPVersion } from "@/store/ip";
import { languageAtom } from "@/store/language";
import { Screen, screenSizeAtom } from "@/store/screen";
import logging from "@/utils/log";

export const Route = createFileRoute("/_app/groups/$id")({
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
    groupId,
    ruleId,
    onClose,
    onConfirm,
}: {
    modal: ReturnType<typeof useDisclosure>;
    groupId: string;
    ruleId: number | null;
    onClose?: () => void;
    onConfirm?: () => void;
}) {
    if (!ruleId) return null;
    const ruleState = useAtomValue(
        selectAtom(
            rulesAtom,
            useCallback((rules) => rules[groupId][ruleId], [ruleId])
        )
    );
    if (!ruleState) return null;
    const rule = ruleState.rule;
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
                                {toProtocolDisplay(rule.protocol, rule.port)}
                            </span>
                        </p>
                        <p>
                            <span>
                                <Trans>Port: </Trans>
                            </span>
                            <span className="font-mono">{rule.port}</span>
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
                            <span className="font-mono">{rule.notes}</span>
                        </p>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        isLoading={ruleState.deleting}
                        onPress={onConfirm}
                    >
                        <Trans>Confirm</Trans>
                    </Button>
                    <Button color="danger" variant="light" onPress={onClose}>
                        <Trans>Cancel</Trans>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

function Rules() {
    const { id: groupId = "" } = Route.useParams();

    const navigate = useNavigate();

    const { t } = useLingui();

    const screenSize = useAtomValue(screenSizeAtom);
    const groupState = useAtomValue(
        selectAtom(
            groupsAtom,
            useCallback((groups) => groups[groupId], [])
        )
    );
    const rules = useAtomValue(rulesAtom)[groupId];
    const language = useAtomValue(languageAtom);

    if (!groupState) {
        logging.warn(`Group with ID ${groupId} not found`);
        toast.error(t`Group with ID ${groupId} not found`);
        navigate({
            to: "/",
        });
        return;
    }

    const group = groupState.group;
    const refreshing = groupState.refreshing;
    const shouldUpdateFromDB = groupState.shouldUpdateFromDB;
    const isRulesOutdated = groupState.isRulesOutdated;
    const ipv4Rules = Object.values(rules || {}).filter(
        (state) => state.rule.ip_type === IPVersion.V4
    );
    const ipv6Rules = Object.values(rules || {}).filter(
        (state) => state.rule.ip_type === IPVersion.V6
    );

    const setNewRule = useSetAtom(setNewRuleAtom);
    const setGroups = useSetAtom(groupsAtom);
    const setRules = useSetAtom(rulesAtom);

    const vultrAPI = useVultrAPI();

    const deleteModal = useDisclosure();

    const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);

    const handleModalClose = useCallback(() => {
        deleteModal.onClose();
    }, []);
    const handleModalConfirm = useCallback(async () => {
        await handleDelete(group.id, selectedRuleId);
        handleModalClose();
    }, [selectedRuleId]);

    const handleRefresh = useCallback(async (groupId: string) => {
        try {
            logging.info(`Fetching firewall rules for group ${groupId}.`);
            setGroups((state) => {
                state[groupId]!.refreshing = true;
            });
            await db.rules
                .where("[group_id+id]")
                .between([groupId, Dexie.minKey], [groupId, Dexie.maxKey])
                .delete();
            logging.info(
                `Successfully cleared rules in local database for group ${groupId}.`
            );
            const { firewall_rules: rules } = await vultrAPI.firewall.listRules(
                {
                    "firewall-group-id": groupId,
                }
            );
            setRules((state) => {
                state[groupId] = {};
                rules.forEach((rule) => {
                    state[groupId][rule.id] = {
                        rule: rule as Rule,
                        deleting: false,
                    };
                });
            });
            await db.rules.bulkPut(
                rules.map((rule) => ({
                    ...(rule as Rule),
                    group_id: groupId,
                }))
            );
            setGroups((state) => {
                state[groupId].isRulesOutdated = false;
                state[groupId].refreshing = false;
            });
            logging.info(
                `Successfully added rules of group ${groupId} to local database.`
            );
        } catch (err) {
            logging.error(
                `Failed to fetch firewall rules for group ${groupId}: ${err}`
            );
            const message =
                err instanceof Error ? err.message : "Unknown error";
            toast.error(
                t`Failed to fetch firewall rules for group ${groupId}: ${message}`
            );
            setRules((state) => {
                delete state[groupId];
            });
            setGroups((state) => {
                state[groupId].refreshing = false;
            });
        }
    }, []);
    const handleDelete = useCallback(
        async (groupId: string, ruleId: number | null) => {
            if (!ruleId) {
                logging.warn(`Delete rule operation failed: Rule ID is null`);
                toast.error(t`Delete rule operation failed: Rule ID is null`);
                return;
            }
            logging.info(`Deleting the rule ${ruleId} in group ${groupId}.`);
            setRules((state) => {
                state[groupId][ruleId].deleting = true;
            });

            await vultrAPI.firewall
                .deleteRule({
                    "firewall-group-id": groupId,
                    "firewall-rule-id": ruleId.toString(),
                })
                .then(() =>
                    logging.info(
                        `Successfully deleted the rule ${ruleId} in group ${groupId} from Vultr API.`
                    )
                )
                .then(() => db.rules.delete([groupId, ruleId]))
                .then(() => {
                    logging.info(
                        `Successfully deleted the rule ${ruleId} in group ${groupId} from local database.`
                    );

                    setRules((state) => {
                        delete state[groupId][ruleId];
                    });
                    setGroups((state) => {
                        state[groupId].group.rule_count -= 1;
                    });
                    logging.info(
                        `Successfully deleted the rule ${ruleId} in group ${groupId}.`
                    );
                    toast.success(t`Successfully deleted the rule.`);
                })
                .catch((err: Error) => {
                    logging.error(
                        `Failed to delete the rule ${ruleId} in group ${groupId}: ${err}`
                    );
                    const message = err.message;
                    toast.error(t`Failed to delete the rule: ${message}`);
                    setRules((state) => {
                        if (state[groupId] && state[groupId][ruleId]) {
                            state[groupId][ruleId].deleting = false;
                        }
                    });
                });
        },
        []
    );
    const handleCreate = useCallback(
        async (groupId: string, newRule: CreateRule) => {
            try {
                logging.info(
                    `Creating a new rule ${JSON.stringify(newRule)} in group ${groupId}.`
                );
                setGroups((state) => {
                    state[groupId].newRule[newRule.ip_type].creating = true;
                });
                const { firewall_rule: rule } =
                    await vultrAPI.firewall.createRule({
                        "firewall-group-id": groupId,
                        ...newRule,
                    });
                logging.info(
                    `Successfully created the rule ${rule.id} in group ${groupId}`
                );
                await db.rules.add({
                    ...(rule as Rule),
                    group_id: groupId,
                });
                logging.info(
                    `Successfully added the new rule to local database.`
                );
                setRules((state) => {
                    state[groupId][rule.id] = {
                        rule: {
                            ...newRule,
                            id: rule.id,
                            action: "accept",
                        },
                        deleting: false,
                    };
                });
                setGroups((state) => {
                    state[groupId].group.rule_count += 1;
                    state[groupId].newRule[newRule.ip_type] =
                        newRule.ip_type === IPVersion.V4
                            ? initialNewRuleIPv4
                            : initialNewRuleIPv6;
                });
                logging.info(
                    `Successfully created the rule ${rule.id} in group ${groupId}.`
                );
                toast.success(t`Successfully created the rule.`);
            } catch (err) {
                logging.error(
                    `Failed to create the rule ${JSON.stringify(
                        newRule
                    )} in group ${groupId}: ${err}`
                );
                const message =
                    err instanceof Error ? err.message : "Unknown error";
                toast.error(t`Failed to create the rule: ${message}`);
                setGroups((state) => {
                    state[groupId].newRule[newRule.ip_type].creating = false;
                });
            }
        },
        []
    );
    const onRuleDelete = useCallback((ruleId: number) => {
        setSelectedRuleId(ruleId);
        deleteModal.onOpen();
    }, []);
    const onRuleCreate = useCallback((rule: NewRuleState) => {
        const newRule = toCreateRule(rule);
        handleCreate(group.id, newRule);
    }, []);
    const onRuleChange = useCallback((rule: NewRuleState) => {
        setNewRule(group.id, rule);
    }, []);

    useEffect(() => {
        if (shouldUpdateFromDB) {
            const restoreRulesFromDB = async () => {
                try {
                    setGroups((state) => {
                        state[groupId].refreshing = true;
                    });
                    const rules = await db.rules.toArray();
                    setRules((state) => {
                        state[groupId] = {};
                        rules.forEach((rule) => {
                            state[groupId][rule.id] = {
                                rule,
                                deleting: false,
                            };
                        });
                        setGroups((state) => {
                            state[groupId].shouldUpdateFromDB = false;
                        });
                    });
                } catch (err) {
                    logging.error(
                        `Failed to fetch firewall rules from DB: ${err}`
                    );
                } finally {
                    setGroups((state) => {
                        state[groupId].refreshing = false;
                    });
                }
            };
            restoreRulesFromDB();
        }
    }, [shouldUpdateFromDB]);

    useEffect(() => {
        if (isRulesOutdated) {
            handleRefresh(groupId);
        }
    }, [isRulesOutdated]);

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
                    <span className="font-bold font-mono">{groupId}</span>
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
                            rules={ipv4Rules}
                            newRule={groupState.newRule[IPVersion.V4]}
                            refreshing={refreshing}
                            onRuleDelete={onRuleDelete}
                            onRuleCreate={onRuleCreate}
                            onRuleChange={onRuleChange}
                        />
                    </Tab>
                    <Tab key="IPv6" title="IPv6">
                        <RulesTable
                            ipVersion={IPVersion.V6}
                            rules={ipv6Rules}
                            newRule={groupState.newRule[IPVersion.V6]}
                            refreshing={refreshing}
                            onRuleDelete={onRuleDelete}
                            onRuleCreate={onRuleCreate}
                            onRuleChange={onRuleChange}
                        />
                    </Tab>
                </Tabs>
                <DeleteModal
                    modal={deleteModal}
                    ruleId={selectedRuleId}
                    groupId={groupId}
                    onClose={handleModalClose}
                    onConfirm={handleModalConfirm}
                />
            </div>
            <div className="flex gap-4 justify-center items-center flex-wrap">
                <Button
                    onPress={() => handleRefresh(groupId)}
                    isLoading={refreshing}
                >
                    <Trans>Refresh</Trans>
                </Button>
                <ProxySwitch />
            </div>
        </div>
    );
}
