import { Divider, Tooltip } from "@heroui/react";
import { Plural, Trans } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import { useVultrAPI } from "@/hooks/vultr";
import {
    groupsStateAtom,
    initialNewRuleIPv4,
    initialNewRuleIPv6,
} from "@/store/firewall";
import { Version as IPVersion } from "@/store/ip";
import { languageAtom } from "@/store/language";

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

export default function GroupInfo({ groupId }: { groupId: string }) {
    const vultrAPI = useVultrAPI();

    const groupQuery = useQuery({
        queryKey: ["groups", groupId],
        staleTime: 1000 * 30, // 30 seconds
        queryFn: async () =>
            await vultrAPI.firewall.getGroup({ "firewall-group-id": groupId }),
        select: (data) => data.firewall_group,
    });

    const language = useAtomValue(languageAtom);

    const setGroupsState = useSetAtom(groupsStateAtom);

    const group = groupQuery.data;

    useEffect(() => {
        if (!groupQuery.data) return;
        setGroupsState((state) => {
            if (!state[groupId]) {
                state[groupId] = {
                    group: groupQuery.data,
                    newRule: {
                        [IPVersion.V4]: initialNewRuleIPv4,
                        [IPVersion.V6]: initialNewRuleIPv6,
                    },
                    newDescription: groupQuery.data.description,
                    isUpdating: false,
                    isDeleting: false,
                };
            } else {
                state[groupId].group = groupQuery.data;
            }
        });
    }, [groupQuery.data]);

    if (!group) return null;

    return (
        <>
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
            <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="flex flex-col gap-2 items-center">
                    <p className="text-default-400 text-sm md:text-base">
                        <Trans>Description</Trans>
                    </p>
                    <p className="font-mono text-sm md:text-base">
                        {group.description}
                    </p>
                </div>
                <Divider
                    orientation="vertical"
                    className="hidden h-auto self-stretch bg-default-400 sm:block"
                />
                <div className="flex flex-col gap-2 items-center">
                    <p className="text-default-400 text-sm md:text-base">
                        <Trans>Group Rules</Trans>
                    </p>
                    <p className="font-mono text-sm md:text-base">
                        <span className="text-primary">{group.rule_count}</span>
                        <span>/</span>
                        <span>{group.max_rule_count}</span>
                    </p>
                </div>
                <Divider
                    orientation="vertical"
                    className="hidden h-auto self-stretch bg-default-400 sm:block"
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
        </>
    );
}
