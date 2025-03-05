import { Button } from "@heroui/react";
import { Image } from "@heroui/react";
import appIcon from "@img/app-icon.png";
import { ErrorComponentProps } from "@tanstack/react-router";

import logging from "./utils/log";

export default function AppError({ error, reset }: ErrorComponentProps) {
    const errorName = error.name;
    const message = error.message;
    logging.error(`${error}`);
    return (
        <div className="w-full h-screen px-4 flex flex-col items-center justify-center gap-2">
            <Image alt="LavaScope Logo" src={appIcon} className="w-20 h-20" />
            <h1 className="text-2xl sm:text-4xl sm:font-bold text-danger">
                {errorName}
            </h1>
            <p className="text-base text-center sm:text-lg text-foreground">
                {message}
            </p>
            <Button onPress={reset}>Retry</Button>
        </div>
    );
}
