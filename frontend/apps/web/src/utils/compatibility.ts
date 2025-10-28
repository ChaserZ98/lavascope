import logging from "@lavascope/log";
import { Platform } from "@lavascope/store";

import supportedBrowsers from "./supportedBrowsers";

export class CompatibilityError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CompatibilityError";
    }
}

export function checkCompatibility(platform: Platform) {
    const isSupported = supportedBrowsers.test(navigator.userAgent);
    if (platform === Platform.MACOS) {
        // browserslist currently has no support for macos webview
        // so we will always assume that it is supported
        logging.info(`WebView support: OK`);
        return;
    } else if (platform === Platform.WEB) {
        if (isSupported) {
            logging.info("Browser support: OK");
            return;
        }
        logging.error(`Browser support: Not OK`);
        throw new CompatibilityError("Your browser may not be supported. Some features may not work as expected. Please try updating your browser or using a different one.");
    } else {
        if (isSupported) {
            logging.info("Browser support: OK");
            return;
        }
        logging.error(`WebView support: Not OK`);
        throw new CompatibilityError("Your browser may not be supported. Some features may not work as expected. Please try updating your browser or using a different one.");
    }
}
