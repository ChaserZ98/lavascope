use super::translator::TranslatorState;
use crate::utils::translator::Locale;
use std::{collections::HashMap, sync::Mutex};
use tauri::{
    menu::{Menu, MenuEvent, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, State, Wry,
};

pub struct MenuState {
    pub menu: Menu<Wry>,
}

impl MenuState {
    pub fn borrow_from_app(app: &AppHandle) -> Result<State<Mutex<Self>>, String> {
        match app.try_state::<Mutex<Self>>() {
            Some(menu_state) => Ok(menu_state),
            None => Err("Failed to get menu state".to_string()),
        }
    }
}

pub fn create_tray(app: &AppHandle) -> Result<TrayIcon, tauri::Error> {
    let translator_state = match TranslatorState::borrow_from_app(app) {
        Ok(translator_state) => translator_state,
        Err(message) => {
            log::error!("{message}");
            return Err(tauri::Error::AssetNotFound(message));
        }
    };
    let translator = &mut translator_state.lock().unwrap().translator;

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
    let menu = Menu::with_id_and_items(app, "tray-menu", &[&hide_or_show, &quit])?;
    app.manage(Mutex::new(MenuState { menu }));

    TrayIconBuilder::with_id("mainTray")
        .tooltip("Vultr Firewall Watcher")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&app.state::<Mutex<MenuState>>().lock().unwrap().menu)
        .show_menu_on_left_click(false)
        .on_menu_event(handle_menu_click)
        .on_tray_icon_event(handle_tray_icon_event)
        .build(app)
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

fn handle_tray_icon_event(tray: &TrayIcon, event: TrayIconEvent) {
    let res = match event {
        TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Up,
            ..
        } => handle_tray_icon_left_click(tray),
        TrayIconEvent::Click {
            button: MouseButton::Right,
            button_state: MouseButtonState::Down,
            ..
        } => handle_tray_icon_right_click(tray),
        _ => Ok(()),
    };

    if let Err(e) = res {
        log::error!("{e}");
    }
}

fn handle_tray_icon_left_click(tray: &TrayIcon) -> Result<(), tauri::Error> {
    let app = tray.app_handle();
    if let Some(window) = app.get_webview_window("main") {
        match window.is_visible() {
            Ok(true) => {
                window.hide()?;
                return Ok(());
            }
            Ok(false) => {
                window.show()?;
                window.set_focus()?;
                return Ok(());
            }
            Err(e) => return Err(e),
        }
    }
    Ok(())
}

fn handle_tray_icon_right_click(tray: &TrayIcon) -> Result<(), tauri::Error> {
    let app = tray.app_handle();
    let menu_state = match MenuState::borrow_from_app(app) {
        Ok(menu_state) => menu_state,
        Err(message) => {
            log::error!("{message}");
            return Err(tauri::Error::AssetNotFound(message));
        }
    };
    let menu = &mut menu_state.lock().unwrap().menu;

    let translator_state = match TranslatorState::borrow_from_app(app) {
        Ok(translator_state) => translator_state,
        Err(message) => {
            log::error!("{message}");
            return Err(tauri::Error::AssetNotFound(message));
        }
    };
    let translator = &mut translator_state.lock().unwrap().translator;

    let window = match tray.app_handle().get_webview_window("main") {
        Some(window) => window,
        None => {
            log::error!("Failed to get main window");
            return Err(tauri::Error::AssetNotFound(
                "Failed to get main window".to_string(),
            ));
        }
    };

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
