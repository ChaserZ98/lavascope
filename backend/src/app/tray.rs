use crate::{
    app::state::{MenuState, StateError, TranslatorState},
    utils::translator::Locale,
};
use std::{collections::HashMap, sync::Mutex};
use tauri::{
    menu::{Menu, MenuEvent, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, Wry,
};

#[derive(thiserror::Error, Debug)]
pub enum CreateTrayError {
    #[error(transparent)]
    StateError(#[from] StateError),
    #[error(transparent)]
    TauriError(#[from] tauri::Error),
}

pub fn create_tray(app: &AppHandle) -> Result<TrayIcon, CreateTrayError> {
    let translator_state_mutex = TranslatorState::try_borrow_from_app(app)?;
    let mut translator_state = translator_state_mutex.lock().unwrap();
    let translator = &mut translator_state.translator;

    translator.insert_message(
        "Hide".to_string(),
        HashMap::from([
            (Locale::EN, "Hide".to_string()),
            (Locale::ZH, "隐藏".to_string()),
            (Locale::ZhHant, "隱藏".to_string()),
        ]),
    );
    translator.insert_message(
        "Show".to_string(),
        HashMap::from([
            (Locale::EN, "Show".to_string()),
            (Locale::ZH, "显示".to_string()),
            (Locale::ZhHant, "顯示".to_string()),
        ]),
    );
    translator.insert_message(
        "Quit".to_string(),
        HashMap::from([
            (Locale::EN, "Quit".to_string()),
            (Locale::ZH, "退出".to_string()),
            (Locale::ZhHant, "退出".to_string()),
        ]),
    );

    let hide_or_show = MenuItem::with_id(
        app,
        "Hide",
        translator.translate_or("Hide"),
        true,
        None::<&str>,
    )?;
    let quit = MenuItem::with_id(
        app,
        "Quit",
        translator.translate_or("Quit"),
        true,
        None::<&str>,
    )?;
    let menu_items: Vec<&dyn tauri::menu::IsMenuItem<Wry>> = vec![&hide_or_show, &quit];
    let menu = Menu::with_id_and_items(app, "tray-menu", &menu_items)?;

    app.manage(Mutex::new(MenuState { menu }));

    let tray_icon = TrayIconBuilder::with_id("mainTray")
        .tooltip("LavaScope")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&app.state::<Mutex<MenuState>>().lock().unwrap().menu)
        .show_menu_on_left_click(false)
        .on_menu_event(handle_menu_click)
        .on_tray_icon_event(handle_tray_icon_event)
        .build(app)?;

    Ok(tray_icon)
}

fn handle_menu_click(app: &AppHandle, event: MenuEvent) {
    let menu_id = event.id.as_ref();
    match menu_id {
        "Quit" => handle_quit(app),
        "Hide" => handle_hide_or_show(app),
        _ => {
            log::error!("Unknown menu item with id: {menu_id}");
        }
    }
}

fn handle_quit(app: &AppHandle) {
    app.get_webview_window("main").unwrap().close().unwrap();
    app.exit(0);
}

fn handle_hide_or_show(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            window.hide().unwrap();
        } else {
            window.show().unwrap();
            window.set_focus().unwrap();
        }
    }
}

#[derive(thiserror::Error, Debug)]
pub enum TrayIconEventError {
    #[error(transparent)]
    LeftClickError(#[from] TrayIconLeftClickError),
    #[error(transparent)]
    RightClickError(#[from] TrayIconRightClickError),
}

fn handle_tray_icon_event(tray: &TrayIcon, event: TrayIconEvent) {
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

    let translator_state_mutex = TranslatorState::try_borrow_from_app(app)?;
    let translator = &mut translator_state_mutex.lock().unwrap().translator;

    let window = tray
        .app_handle()
        .get_webview_window("main")
        .ok_or(TrayIconRightClickError::FailedToGetMainWindow)?;

    let new_text = match window.is_visible().unwrap_or(false) {
        true => translator.translate_or("Hide"),
        false => translator.translate_or("Show"),
    };

    menu.get("Hide")
        .unwrap()
        .as_menuitem()
        .unwrap()
        .set_text(new_text)
        .unwrap();

    Ok(())
}
