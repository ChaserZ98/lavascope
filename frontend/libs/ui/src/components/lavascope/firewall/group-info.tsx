import { languageAtom } from "@lavascope/store";
import { VultrFirewall } from "@lavascope/store/firewlall";
import { Plural, Trans } from "@lingui/react/macro";
import { useAtomValue } from "jotai";

import { Tooltip, TooltipContent, TooltipTrigger } from "#components/ui";

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

function GroupInfo({ group }: { group: VultrFirewall.Group }) {
    const language = useAtomValue(languageAtom);

    return (
        <div className="grid grid-cols-3 w-full gap-4">
            <div className="flex flex-col gap-2 items-center text-sm md:text-base">
                <span>
                    <Trans>Group ID</Trans>
                </span>
                <span className="font-mono text-center">{group.id}</span>
            </div>
            <div className="flex flex-col gap-2 items-center text-sm md:text-base">
                <span>
                    <Trans>Created</Trans>
                </span>
                <Tooltip delayDuration={1000}>
                    <TooltipTrigger asChild>
                        <span className="font-mono text-center">
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
            <div className="flex flex-col gap-2 items-center text-sm md:text-base">
                <span>
                    <Trans>Last Modified</Trans>
                </span>
                <Tooltip delayDuration={1000}>
                    <TooltipTrigger asChild>
                        <span className="font-mono text-center">
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
            <div className="flex flex-col gap-2 items-center text-sm md:text-base">
                <span>
                    <Trans>Description</Trans>
                </span>
                <span className="font-mono">
                    {group.description}
                </span>
            </div>
            <div className="flex flex-col gap-2 items-center text-sm md:text-base">
                <span>
                    <Trans>Group Rules</Trans>
                </span>
                <span className="font-mono">
                    <span className="text-primary">{group.rule_count}</span>
                    /
                    {group.max_rule_count}
                </span>
            </div>
            <div className="flex flex-col gap-2 items-center text-sm md:text-base">
                <span>
                    <Trans>Linked Instances</Trans>
                </span>
                <span className="font-mono">
                    {group.instance_count}
                </span>
            </div>
        </div>
    );
}

export { GroupInfo };
