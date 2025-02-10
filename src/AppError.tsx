import { Button } from "@heroui/react";
import { ErrorComponentProps } from "@tanstack/react-router";

import logging from "./utils/log";

export default function AppError({ error, reset }: ErrorComponentProps) {
    const errorName = error.name;
    const message = error.message;
    logging.error(`${error}`);
    return (
        <div className="w-full h-screen px-4 flex flex-col items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-4xl sm:font-bold">{errorName}</h1>
            <p className="text-base text-center sm:text-lg">{message}</p>
            <Button onPress={reset}>Retry</Button>
        </div>
    );
}
