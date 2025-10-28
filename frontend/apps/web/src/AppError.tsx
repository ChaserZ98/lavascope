import logging from "@lavascope/log";
import { Button } from "@lavascope/ui/components/ui/button";
import type { ErrorComponentProps } from "@tanstack/react-router";

import appIcon from "@/assets/img/app-icon.png";

function AppError({ error, reset }: ErrorComponentProps) {
    const errorName = error.name;
    const message = error.message;
    logging.error(`${error}`);
    return (
        <div className="w-full h-full px-4 flex flex-col items-center justify-center gap-2">
            <img alt="LavaScope Logo" src={appIcon} className="w-20 h-20" />
            <h1 className="text-2xl sm:text-4xl sm:font-bold text-destructive">
                {errorName}
            </h1>
            <p className="text-base text-center sm:text-lg text-foreground">
                {message}
            </p>
            <Button onClick={reset}>Retry</Button>
        </div>
    );
}

export { AppError };
