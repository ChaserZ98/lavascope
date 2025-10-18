import logging from "@lavascope/log";
import { toast } from "react-toastify";

import { Platform } from "@/store/environment";

import supportedBrowsers from "./supportedBrowsers";

export default function checkCompatibility(platform: Platform) {
    const isSupported = supportedBrowsers.test(navigator.userAgent);
    switch (platform) {
        // browserslist currently has no support for macos webview
        // so we will always assume that it is supported
        case Platform.MACOS:
            logging.info(`WebView support: OK`);
            break;
        case Platform.WEB:
            if (isSupported) {
                logging.info(`Browser support: OK`);
            } else {
                logging.error(`Browser support: Not OK`);
                toast.warning(
                    `Your browser may not be supported. Some features may not work as expected. Please try updating your browser or using a different one.`,
                    {
                        autoClose: false,
                        closeButton: false,
                    }
                );
            }
            break;
        default:
            if (isSupported) {
                logging.info(`WebView support: OK`);
            } else {
                logging.error(`WebView support: Not OK`);
                toast.warning(
                    `Your webview may not be supported. Some features may not work as expected. Please try updating your webview.`,
                    {
                        autoClose: false,
                        closeButton: false,
                    }
                );
            }
            break;
    }
}
