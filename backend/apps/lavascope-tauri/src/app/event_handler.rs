use lavascope_state::WindowStateError;
use tauri::{AppHandle, CloseRequestApi};

#[cfg(target_os = "macos")]
#[derive(thiserror::Error, Debug)]
pub enum ReopenEventError {
    #[error("Failed to get webview window for label {0}")]
    WindowNotFound(&'static str),
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
}

#[cfg(target_os = "macos")]
#[allow(dead_code)]
pub fn handle_reopen(app: &AppHandle, _has_visible_windows: bool) -> Result<(), ReopenEventError> {
    use tauri::{ActivationPolicy, Manager};

    use crate::app::MAIN_WINDOW_LABEL;

    // brings dock icon back
    app.set_activation_policy(ActivationPolicy::Regular)?;

    // workaround for macos single instance reopen issue
    // see details https://github.com/tauri-apps/plugins-workspace/issues/1613#issuecomment-2454134194
    let main_window = app
        .get_webview_window(MAIN_WINDOW_LABEL)
        .ok_or(ReopenEventError::WindowNotFound(MAIN_WINDOW_LABEL))?;

    main_window.show()?;
    main_window.set_focus()?;

    Ok(())
}

#[derive(thiserror::Error, Debug)]
pub enum WindowCloseEventError {
    // #[cfg(target_os = "macos")]
    // #[error("Failed to set activation policy to accessory: {0}")]
    // ActivationPolicy(tauri::Error),
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[error(transparent)]
    WindowStateMutex(#[from] WindowStateError),
    #[error(transparent)]
    Notification(#[from] tauri_plugin_notification::Error),
}

pub fn handle_window_close(
    #[allow(unused_variables)] app: &AppHandle,
    api: CloseRequestApi,
) -> Result<(), WindowCloseEventError> {
    api.prevent_close();

    #[cfg(desktop)]
    {
        use lavascope_i18n::t;
        use lavascope_state::WindowState;
        use tauri::Manager;

        use crate::app::MAIN_WINDOW_LABEL;

        if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
            window.hide().ok();
        }

        let window_state = WindowState::try_borrow_from_app(app)?;
        let mut is_first_close_event = window_state.is_first_close_event.lock().unwrap();
        if *is_first_close_event {
            use tauri_plugin_notification::NotificationExt;

            app.notification()
                .builder()
                .title(t!("The application is still running in the background"))
                .show()?;

            *is_first_close_event = false;
        }
    }

    #[cfg(target_os = "macos")]
    {
        use tauri::ActivationPolicy;
        // hide dock icon when window is closed
        app.set_activation_policy(ActivationPolicy::Accessory)?;
    }

    Ok(())
}
