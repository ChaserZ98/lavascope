import { useCallback, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
import { toast } from "react-toastify";

import RulesTable from "@/components/Firewall/Rules/RulesTable";
import ProxySwitch from "@/components/ProxySwitch";
import useFetch from "@/hooks/fetch";
import { Environment, environmentAtom } from "@/store/environment";
import { groupAtom } from "@/store/firewall/groups";
import {
    createRuleAtom,
    deleteRuleByIdAtom,
    NewRuleState,
    newRuleStateToCreateRule,
    portToProtocol,
    refreshingAtom,
    refreshRulesAtom,
    rulesAtom,
    RuleState,
    setNewRuleAtom,
} from "@/store/firewall/rules";
import { Version as IPVersion } from "@/store/ip";
import { Screen, screenSizeAtom } from "@/store/screen";
import { Settings, settingsAtom } from "@/store/settings";

import logging from "@/utils/log";
import { useAtomValue, useSetAtom } from "jotai";

function getRelativeTimeString(date: string) {
    const now = new Date();
    const then = new Date(date);

    let diff = Math.round((now.getTime() - then.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }
    if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }
    if (diff < 604800) {
        const days = Math.floor(diff / 86400);
        return `${days} day${days === 1 ? "" : "s"} ago`;
    }
    if (diff < 2592000) {
        const weeks = Math.floor(diff / 604800);
        return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
    }
    if (diff < 31536000) {
        const months = Math.floor(diff / 2592000);
        return `${months} month${months === 1 ? "" : "s"} ago`;
    }
    const years = Math.floor(diff / 31536000);
    return `${years} year${years === 1 ? "" : "s"} ago`;
}

export default function Rules() {
    const { id = "" } = useParams<{ id: string }>();

    const environment = useAtomValue(environmentAtom);

    const screenSize = useAtomValue(screenSizeAtom);

    const navigate = useNavigate();

    const settings = useAtomValue(settingsAtom);

    const group = useAtomValue(groupAtom(id));
    const rules = useAtomValue(rulesAtom(id));
    const refreshing = useAtomValue(refreshingAtom(id));
    const refreshRules = useSetAtom(refreshRulesAtom);
    const deleteRuleById = useSetAtom(deleteRuleByIdAtom);
    const createRule = useSetAtom(createRuleAtom);
    const setNewRule = useSetAtom(setNewRuleAtom);

    const fetchClient = useFetch(
        settings.useProxy
            ? {
                  proxy: {
                      http: settings.proxyAddress,
                      https: settings.proxyAddress,
                  },
              }
            : undefined
    );

    const deleteModal = useDisclosure();

    const selectedRule = useRef<RuleState | null>(null);
    const deleteTimeoutId = useRef<number | null>(null);

    const refresh = useCallback(
        (id: string, settings: Settings, fetchClient: typeof fetch) => {
            if (!id) {
                toast.error(`Empty group ID`);
                return;
            }
            refreshRules(id, settings.apiToken, fetchClient);
        },
        []
    );

    const onRuleDelete = useCallback((rule: RuleState) => {
        deleteTimeoutId.current && clearTimeout(deleteTimeoutId.current);
        selectedRule.current = rule;
        deleteModal.onOpen();
    }, []);
    const onRuleCreate = useCallback(
        (rule: NewRuleState) => {
            const newRule = newRuleStateToCreateRule(rule);
            createRule(group.id, newRule, settings.apiToken, fetchClient);
        },
        [settings, fetchClient]
    );
    const onRuleChange = useCallback((rule: NewRuleState) => {
        setNewRule(group.id, rule);
    }, []);

    useEffect(() => {
        if (!group.id) {
            logging.warn(`Group with ID ${id} not found`);
            toast.error(`Group with ID ${id} not found`);
            navigate("/");
            return;
        }
        if (group.id && group.meta === undefined)
            refresh(group.id, settings, fetchClient);
    }, [group, fetchClient, settings]);

    return (
        <div className="flex flex-col px-8 pb-4 gap-4 items-center select-none">
            <h2 className="text-lg font-bold text-foreground transition-colors-opacity md:text-2xl">
                Manage Firewall Group
            </h2>
            <div className="flex w-full items-center justify-center gap-4">
                <div className="text-xs md:text-sm">
                    <span>Group ID: </span>
                    <span className="font-bold font-mono">{id}</span>
                </div>
                <div className="text-xs md:text-sm">
                    <span>Created: </span>
                    <Tooltip
                        content={getRelativeTimeString(group.date_created)}
                        delay={2000}
                        closeDelay={500}
                    >
                        <span className="font-mono">
                            {new Date(group.date_created).toLocaleString(
                                Intl.DateTimeFormat().resolvedOptions().locale,
                                {
                                    timeZoneName: "short",
                                    hour12: false,
                                }
                            )}
                        </span>
                    </Tooltip>
                </div>
                <div className="text-xs md:text-sm">
                    <span>Modified: </span>
                    <Tooltip
                        content={getRelativeTimeString(group.date_created)}
                        delay={2000}
                        closeDelay={500}
                    >
                        <span className="font-mono">
                            {new Date(group.date_created).toLocaleString(
                                Intl.DateTimeFormat().resolvedOptions().locale,
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
                        Description
                    </p>
                    <p className="font-mono text-sm md:text-base">
                        {group.description ? group.description : "[Empty]"}
                    </p>
                </div>
                <Divider
                    orientation="vertical"
                    className="h-auto self-stretch bg-default-400"
                />
                <div className="flex flex-col gap-2 items-center">
                    <p className="text-default-400 text-sm md:text-base">
                        Group Rules
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
                        Linked Instances
                    </p>
                    <p className="font-mono text-sm md:text-base">
                        {group.instance_count}
                    </p>
                </div>
            </div>
            <div className="flex flex-col w-full relative justify-between bg-content1 p-4 overflow-auto rounded-large shadow-small shadow-content1 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow] ease-[ease] duration-250 max-w-fit min-h-60">
                <Tabs
                    aria-label="Options"
                    isVertical={screenSize === Screen.SM ? false : true}
                    color="primary"
                    radius="lg"
                    size={screenSize === Screen.SM ? "sm" : "md"}
                    variant="solid"
                    classNames={{
                        base: "w-full justify-center md:w-auto",
                        tabList: "transition-colors-opacity bg-content2",
                        cursor: "transition-colors-opacity",
                        tab: "transition-colors-opacity",
                        panel: "w-full flex justify-center py-2 md:py-3",
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
                <Modal
                    backdrop="transparent"
                    isOpen={deleteModal.isOpen}
                    onClose={() => {
                        deleteTimeoutId.current = setTimeout(() => {
                            selectedRule.current = null;
                        }, 1500);
                        deleteModal.onClose();
                    }}
                    classNames={{
                        base: "select-none",
                    }}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1 text-danger-400">
                                    Delete Firewall Rule
                                </ModalHeader>
                                <ModalBody>
                                    <p>
                                        Are you sure you want to delete this
                                        rule?
                                    </p>
                                    <div className="text-warning">
                                        <p>
                                            <span>IP Version: </span>
                                            <span className="font-mono">
                                                {selectedRule.current
                                                    ?.ip_type === IPVersion.V4
                                                    ? "IPv4"
                                                    : "IPv6"}
                                            </span>
                                        </p>
                                        <p>
                                            <span>Protocol: </span>
                                            <span className="font-mono uppercase">
                                                {selectedRule.current
                                                    ?.protocol +
                                                    (portToProtocol(
                                                        selectedRule.current
                                                            ?.port || ""
                                                    )
                                                        ? `(${portToProtocol(
                                                              selectedRule
                                                                  .current
                                                                  ?.port || ""
                                                          )})`
                                                        : "")}
                                            </span>
                                        </p>
                                        <p>
                                            <span>Port: </span>
                                            <span className="font-mono">
                                                {selectedRule.current?.port}
                                            </span>
                                        </p>
                                        <p>
                                            <span>Source Type: </span>
                                            <span className="font-mono capitalize">
                                                {selectedRule.current?.source}
                                            </span>
                                        </p>
                                        <p>
                                            <span>Source Address: </span>
                                            <span className="font-mono">
                                                {`${selectedRule.current?.subnet}/${selectedRule.current?.subnet_size}`}
                                            </span>
                                        </p>
                                        <p>
                                            <span>Notes: </span>
                                            <span className="font-mono">
                                                {selectedRule.current?.notes}
                                            </span>
                                        </p>
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        color="primary"
                                        isLoading={
                                            selectedRule.current?.deleting
                                        }
                                        onPress={() => {
                                            if (!selectedRule.current) {
                                                logging.warn(
                                                    `Delete rule operation failed: Rule ID is null`
                                                );
                                                toast.error(
                                                    `Delete rule operation failed: Rule ID is null`
                                                );
                                                return;
                                            }
                                            selectedRule.current.deleting =
                                                true;
                                            deleteRuleById(
                                                group.id,
                                                selectedRule.current.id,
                                                settings.apiToken,
                                                fetchClient
                                            ).finally(() => onClose());
                                        }}
                                    >
                                        Confirm
                                    </Button>
                                    <Button
                                        color="danger"
                                        variant="light"
                                        onPress={onClose}
                                    >
                                        Cancel
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </div>
            <div className="flex gap-4 justify-center items-center flex-wrap">
                <Button
                    onPress={() => refresh(id, settings, fetchClient)}
                    isLoading={refreshing}
                >
                    Refresh
                </Button>
                {environment !== Environment.WEB && <ProxySwitch />}
            </div>
        </div>
    );
}
