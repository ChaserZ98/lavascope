pub mod error;
pub mod event;
pub mod menu;

use std::sync::Mutex;

use error::CreateTrayError;
use menu::{create_tray_menu, event::handle_menu_click, i18n::init_tray_menu_i18n};
use tauri::{
    tray::{TrayIcon, TrayIconBuilder},
    AppHandle, Manager,
};

use crate::app::{
    state::{MenuState, TranslatorState},
    tray::event::handle_tray_icon_event,
};

pub fn create_tray(app: &AppHandle) -> Result<TrayIcon, CreateTrayError> {
    let translator_state_mutex = TranslatorState::try_borrow_from_app(app)?;
    let mut translator_state = translator_state_mutex.lock().unwrap();
    let translator = &mut translator_state.translator;

    init_tray_menu_i18n(translator);

    let menu = create_tray_menu(app, translator)?;

    app.manage(Mutex::new(MenuState { menu }));

    let icon = app.default_window_icon().unwrap().clone();
    let menu_state = app.state::<Mutex<MenuState>>();
    let menu = &menu_state.lock().unwrap().menu;

    let tray_icon = TrayIconBuilder::with_id("mainTray")
        .tooltip("LavaScope")
        .icon(icon)
        .menu(menu)
        .show_menu_on_left_click(false)
        .on_menu_event(handle_menu_click)
        .on_tray_icon_event(handle_tray_icon_event)
        .build(app)?;

    Ok(tray_icon)
}
