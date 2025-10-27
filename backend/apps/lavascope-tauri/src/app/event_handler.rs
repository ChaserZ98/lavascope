use tauri::AppHandle;

pub fn handle_reopen(app: &AppHandle, _has_visible_windows: bool) {
    #[cfg(target_os = "macos")]
    {
        use tauri::{ActivationPolicy, Manager};

        // brings dock icon back
        let _ = app.set_activation_policy(ActivationPolicy::Regular);

        // workaround for macos single instance reopen issue
        // see details https://github.com/tauri-apps/plugins-workspace/issues/1613#issuecomment-2454134194
        let main_window = app.get_webview_window("main").unwrap();
        let _ = main_window.show();
        let _ = main_window.set_focus();
    }
}

pub fn handle_window_close(app: &AppHandle) {
    #[cfg(target_os = "macos")]
    {
        use tauri::ActivationPolicy;
        // hide dock icon when window is closed
        let _ = app
            .set_activation_policy(ActivationPolicy::Accessory)
            .map_err(|e| log::error!("Failed to set activation policy to accessory: {}", e));
    }
}
