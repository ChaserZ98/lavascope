use lavascope_i18n::t;
use lavascope_state::{MenuState, MenuStateError, WindowState, WindowStateError};
use tauri::{
    Manager,
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconEvent},
};

use crate::error::TrayIconEventError;

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
    Tauri(#[from] tauri::Error),
    #[error(transparent)]
    WindowState(#[from] WindowStateError),
    #[error("Failed to get webview window for label {0}")]
    WindowNotFound(&'static str),
}

fn handle_tray_icon_left_click(tray: &TrayIcon) -> Result<(), TrayIconLeftClickError> {
    let app = tray.app_handle();

    let window_state = WindowState::try_borrow_from_app(app)?;
    let main_window_label = window_state.main_window_label;

    let window = app
        .get_webview_window(main_window_label)
        .ok_or(TrayIconLeftClickError::WindowNotFound(main_window_label))?;

    let is_window_visible = window.is_visible()?;
    if is_window_visible {
        window.hide()?;
    } else {
        #[cfg(target_os = "macos")]
        app.set_activation_policy(tauri::ActivationPolicy::Regular)?;

        window.show()?;
        window.set_focus()?;
    }

    Ok(())
}

#[derive(thiserror::Error, Debug)]
pub enum TrayIconRightClickError {
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[error(transparent)]
    MenuState(#[from] MenuStateError),
    #[error(transparent)]
    WindowState(#[from] WindowStateError),
    #[error("Failed to get webview window for label {0}")]
    WindowNotFound(&'static str),
}

fn handle_tray_icon_right_click(tray: &TrayIcon) -> Result<(), TrayIconRightClickError> {
    let app = tray.app_handle();
    let menu_state_mutex = MenuState::try_borrow_from_app(app)?;
    // if let Err(e) = menu_state_mutex.lock()
    let menu = &mut menu_state_mutex.lock().unwrap().menu;

    let window_state = WindowState::try_borrow_from_app(app)?;
    let main_window_label = window_state.main_window_label;

    let window = tray
        .app_handle()
        .get_webview_window(main_window_label)
        .ok_or(TrayIconRightClickError::WindowNotFound(main_window_label))?;

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
