import logging from "@lavascope/log";
import {
    isPermissionGranted,
    requestPermission,
    sendNotification,
} from "@tauri-apps/plugin-notification";

type Content = string | { title: string; body: string };

async function tauriNotify(content: Content) {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
        logging.info(
            "Notification permission not granted, requesting permission"
        );
        const permission = await requestPermission();
        if (permission === "granted") {
            logging.info("Notification permission granted");
            permissionGranted = true;
        } else {
            logging.info("Notification permission denied");
            permissionGranted = false;
        }
    }
    if (permissionGranted) {
        sendNotification(content);
    }
}

export { tauriNotify };
