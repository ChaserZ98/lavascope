import logging from "@lavascope/log";
import { arch, Platform, version } from "@lavascope/store";
import { useEffect } from "react";

function useLogPlatformInfoEffect({ appMode, platform }: { appMode: string; platform: Platform }) {
    useEffect(() => {
        logging.info(`Platform: ${platform}`);
        if (platform !== Platform.WEB) {
            logging.info(`OS Version: ${version()}`);
            logging.info(`Arch: ${arch()}`);
        }
        logging.info(`User Agent: ${navigator.userAgent}`);
        logging.info(`App Mode: ${appMode}`);
    }, []);
}

function useAllPlatformEffect({ appMode, platform }: { appMode: string; platform: Platform }) {
    useLogPlatformInfoEffect({ appMode, platform });
}

export { useAllPlatformEffect };
