import { languageAtom } from "@lavascope/store";
import { VultrFirewall } from "@lavascope/store/firewlall";
import { Plural, Trans } from "@lingui/react/macro";
import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { useMemo } from "react";

import { Separator, Tooltip, TooltipContent, TooltipTrigger } from "#components/ui";

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

function GroupInfo({ groupId }: { groupId: string }) {
    const groupAtom = useMemo(() => selectAtom(VultrFirewall.groupsStateAtom, (state) => state[groupId]?.group), []);

    const language = useAtomValue(languageAtom);
    const group = useAtomValue(groupAtom);

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
                    <Tooltip delayDuration={1000}>
                        <TooltipTrigger asChild>
                            <span className="font-mono">
                                {
                                    new Date(group.date_created).toLocaleString(
                                        language,
                                        {
                                            timeZoneName: "short",
                                            hour12: false,
                                        }
                                    )
                                }
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <RelativeTime date={group.date_created} />
                        </TooltipContent>
                    </Tooltip>
                </div>
                <div className="text-xs md:text-sm">
                    <span>
                        <Trans>Last Modified: </Trans>
                    </span>
                    <Tooltip delayDuration={1000}>
                        <TooltipTrigger asChild>
                            <span className="font-mono">
                                {
                                    new Date(group.date_created).toLocaleString(
                                        language,
                                        {
                                            timeZoneName: "short",
                                            hour12: false,
                                        }
                                    )
                                }
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <RelativeTime date={group.date_created} />
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
            <div className="flex items-center gap-4 sm:flex-row">
                <div className="flex flex-col gap-2 items-center">
                    <p className="text-default-400 text-sm md:text-base">
                        <Trans>Description</Trans>
                    </p>
                    <p className="font-mono text-sm md:text-base">
                        {group.description}
                    </p>
                </div>
                <Separator orientation="vertical" className="hidden sm:block" />
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
                <Separator orientation="vertical" className="hidden sm:block" />
                <div className="flex flex-col gap-2 items-center">
                    <p className="text-default-400 text-sm md:text-base">
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

export { GroupInfo };
