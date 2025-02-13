import { toast } from "react-toastify";

import { Environment } from "@/store/environment";

import logging from "./log";
import supportedBrowsers from "./supportedBrowsers";

export default function checkCompatibility(environment: Environment) {
    const isSupported = supportedBrowsers.test(navigator.userAgent);
    switch (environment) {
        // browserslist currently has no support for macos webview
        // so we will always assume that it is supported
        case Environment.MACOS:
            logging.info(`WebView support: OK`);
            break;
        case Environment.WEB:
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
