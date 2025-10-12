use std::sync::Mutex;

use tauri::{
    tray::{TrayIcon, TrayIconBuilder as TauriTrayIconBuilder},
    AppHandle, Manager,
};

use crate::app::{
    state::MenuState,
    tray::{
        error::CreateTrayError,
        event::handle_tray_icon_event,
        menu::{handle_menu_click, TrayIconMenuBuilder},
    },
};

pub struct TrayIconBuilder {}

impl TrayIconBuilder {
    pub fn build(app: &AppHandle) -> Result<TrayIcon, CreateTrayError> {
        let menu = TrayIconMenuBuilder::build(app)?;

        app.manage(Mutex::new(MenuState { menu }));

        let icon = app.default_window_icon().unwrap().clone();
        let menu_state = app.state::<Mutex<MenuState>>();
        let menu = &menu_state.lock().unwrap().menu;

        let tray_icon = TauriTrayIconBuilder::with_id("mainTray")
            .tooltip("LavaScope")
            .icon(icon)
            .menu(menu)
            .show_menu_on_left_click(false)
            .on_menu_event(handle_menu_click)
            .on_tray_icon_event(handle_tray_icon_event)
            .build(app)?;

        Ok(tray_icon)
    }
}
