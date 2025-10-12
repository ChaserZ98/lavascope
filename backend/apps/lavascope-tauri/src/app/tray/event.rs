use lavascope_i18n::t;
use tauri::{
    Manager,
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconEvent},
};

use crate::app::{
    state::{MenuState, StateError},
    tray::error::TrayIconEventError,
};

pub fn handle_tray_icon_event(tray: &TrayIcon, event: TrayIconEvent) {
    let res: Result<(), TrayIconEventError> = match event {
        TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Up,
            ..
        } => handle_tray_icon_left_click(tray).map_err(|e| e.into()),
        TrayIconEvent::Click {
            button: MouseButton::Right,
            button_state: MouseButtonState::Down,
            ..
        } => handle_tray_icon_right_click(tray).map_err(|e| e.into()),
        _ => Ok(()),
    };

    if let Err(e) = res {
        log::error!("{e}");
    }
}

#[derive(thiserror::Error, Debug)]
pub enum TrayIconLeftClickError {
    #[error(transparent)]
    TauriError(#[from] tauri::Error),
}

fn handle_tray_icon_left_click(tray: &TrayIcon) -> Result<(), TrayIconLeftClickError> {
    let app = tray.app_handle();
    if let Some(window) = app.get_webview_window("main") {
        let is_window_visible = window.is_visible()?;
        if is_window_visible {
            window.hide()?;
        } else {
            window.show()?;
            window.set_focus()?;
        }

        return Ok(());
    }
    Ok(())
}

#[derive(thiserror::Error, Debug)]
pub enum TrayIconRightClickError {
    #[error(transparent)]
    TauriError(#[from] tauri::Error),
    #[error(transparent)]
    StateError(#[from] StateError),
    #[error("Failed to get main window")]
    FailedToGetMainWindow,
}

fn handle_tray_icon_right_click(tray: &TrayIcon) -> Result<(), TrayIconRightClickError> {
    let app = tray.app_handle();
    let menu_state_mutex = MenuState::try_borrow_from_app(app)?;
    let menu = &mut menu_state_mutex.lock().unwrap().menu;

    let window = tray
        .app_handle()
        .get_webview_window("main")
        .ok_or(TrayIconRightClickError::FailedToGetMainWindow)?;

    let new_text = match window.is_visible().unwrap_or(false) {
        true => t!("Hide"),
        false => t!("Show"),
    };

    menu.get("Hide")
        .unwrap()
        .as_menuitem()
        .unwrap()
        .set_text(new_text)
        .unwrap();

    Ok(())
}
