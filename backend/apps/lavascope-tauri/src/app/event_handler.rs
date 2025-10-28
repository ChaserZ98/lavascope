use lavascope_state::WindowStateError;
use tauri::AppHandle;

#[cfg(target_os = "macos")]
#[derive(thiserror::Error, Debug)]
pub enum ReopenEventError {
    #[error("Failed to get webview window for label {0}")]
    GetWindowError(String),
    #[error("Failed to set activation policy to regular")]
    ActivationPolicyError,
}

#[cfg(target_os = "macos")]
#[allow(dead_code)]
pub fn handle_reopen(app: &AppHandle, _has_visible_windows: bool) -> Result<(), ReopenEventError> {
    use tauri::{ActivationPolicy, Manager};

    // brings dock icon back
    app.set_activation_policy(ActivationPolicy::Regular)
        .map_err(|e| ReopenEventError::ActivationPolicyError)?;

    // workaround for macos single instance reopen issue
    // see details https://github.com/tauri-apps/plugins-workspace/issues/1613#issuecomment-2454134194
    let main_window = app
        .get_webview_window("main")
        .map_err(|e| ReopenEventError::GetWindowError("main".to_string()))?;
    let _ = main_window.show();
    let _ = main_window.set_focus();

    Ok(())
}

#[derive(thiserror::Error, Debug)]
pub enum WindowCloseEventError {
    #[cfg(target_os = "macos")]
    #[error("Failed to set activation policy to accessory: {0}")]
    ActivationPolicy(tauri::Error),
    #[error("Failed to acquire window state mutex")]
    WindowStateMutex(#[from] WindowStateError),
    #[error("Notification error")]
    Notification(#[from] tauri_plugin_notification::Error),
}

pub fn handle_window_close(
    #[allow(unused_variables)] app: &AppHandle,
) -> Result<(), WindowCloseEventError> {
    #[cfg(target_os = "macos")]
    {
        use tauri::ActivationPolicy;
        // hide dock icon when window is closed
        app.set_activation_policy(ActivationPolicy::Accessory)
            .map_err(|e| WindowCloseEventError::ActivationPolicy(e))?;
    }
    #[cfg(desktop)]
    {
        use lavascope_i18n::t;
        use lavascope_state::WindowState;

        let window_state_mutex = WindowState::try_borrow_from_app(app)?;
        let mut window_state = window_state_mutex.lock().unwrap();
        if window_state.is_first_close_event {
            use tauri_plugin_notification::NotificationExt;

            app.notification()
                .builder()
                .title(t!("The application is still running in the background"))
                .show()?;

            window_state.is_first_close_event = false;
        }
    }

    Ok(())
}
