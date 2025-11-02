import { arch, Platform, platformAtom, version } from "@lavascope/store";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@lavascope/ui/components/ui";
import { Plural } from "@lingui/react/macro";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";
import { useAtomValue } from "jotai";

export const Route = createFileRoute("/_app/about")({
    component: About,
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

function About() {
    const platform = useAtomValue(platformAtom);

    return (
        <Card className="flex w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 h-16">
                    <div className="w-16 h-full">
                        <img src="/favicon.ico" />
                    </div>
                    <div>
                        <h1 className="font-bold text-3xl">
                            LavaScope
                        </h1>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex gap-2">
                    <Trans>App Version</Trans>:
                    <span className="font-mono">{__BUILD_INFO__.app_version}</span>
                </div>
                <div className="flex gap-2">
                    <Trans>Frontend Version</Trans>:
                    <span className="font-mono">{__BUILD_INFO__.frontend_version}</span>
                </div>
                <div className="flex gap-2">
                    <Trans>Backend Version</Trans>:
                    <span className="font-mono">{__BUILD_INFO__.backend_version}</span>
                </div>
                <div className="flex gap-2">
                    <Trans>Build Commit</Trans>:
                    <span className="font-mono break-all">{__BUILD_INFO__.git_commit_hash}</span>
                </div>
                <div className="flex gap-2">
                    <Trans>Build Date</Trans>:
                    <div className="font-mono">
                        <span>
                            {new Date(__BUILD_INFO__.build_date).toLocaleString(
                                Intl.DateTimeFormat().resolvedOptions().locale,
                                {
                                    timeZoneName: "short",
                                    hour12: false,
                                })}
                        </span>
                        {" "}
                        <span>
                            (<RelativeTime date={__BUILD_INFO__.build_date} />)
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Trans>Platform</Trans>:
                    <span className="font-mono">
                        {platform === Platform.WEB ? `${platform}` : `${platform} ${arch()} ${version()}`}
                    </span>
                </div>
            </CardContent>
            <CardFooter className="text-muted-foreground">
                <strong>
                    Copyright © 2025 Feiyu Zheng. All rights reserved.
                </strong>
            </CardFooter>
        </Card>
    );
}
