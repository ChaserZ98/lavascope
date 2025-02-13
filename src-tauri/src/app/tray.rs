use tauri::{
    menu::{Menu, MenuEvent, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, Wry,
};

struct MenuState {
    menu: Menu<Wry>,
}

pub fn create_tray(app: &AppHandle) -> Result<TrayIcon, tauri::Error> {
    let hide_or_show = MenuItem::with_id(app, "hide/show", "Hide", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&hide_or_show, &quit])?;
    app.manage(MenuState { menu });

    TrayIconBuilder::with_id("tray")
        .tooltip("Vultr Firewall Watcher")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&app.state::<MenuState>().menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| menu_click_handler(app, &event))
        .on_tray_icon_event(move |tray, event| system_tray_event_handler(tray, &event))
        .build(app)
}

fn system_tray_event_handler(tray: &TrayIcon, event: &TrayIconEvent) {
    let menu = &tray.app_handle().state::<MenuState>().menu;
    match event {
        TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Up,
            ..
        } => left_click_handler(tray),
        TrayIconEvent::Click {
            button: MouseButton::Right,
            button_state: MouseButtonState::Down,
            ..
        } => right_click_handler(tray, menu),
        _ => {}
    }
}

fn left_click_handler(tray: &TrayIcon) {
    let app = tray.app_handle();
    if let Some(window) = app.get_webview_window("main") {
        if !window.is_visible().unwrap() {
            window.show().unwrap();
            window.set_focus().unwrap();
        } else if window.is_focused().unwrap() {
            window.hide().unwrap();
        } else {
            window.set_focus().unwrap();
        }
    }
}

fn right_click_handler(tray: &TrayIcon, menu: &Menu<Wry>) {
    let window = tray.app_handle().get_webview_window("main").unwrap();
    let new_text = match window.is_visible().unwrap_or(false) {
        true => "Hide",
        false => "Show",
    };
    menu.get("hide/show")
        .unwrap()
        .as_menuitem()
        .unwrap()
        .set_text(new_text)
        .unwrap();
}

fn menu_click_handler(app: &AppHandle, event: &MenuEvent) {
    match event.id.as_ref() {
        "quit" => quit_handler(app),
        "hide/show" => hide_or_show_handler(app),
        _ => {}
    }
}

fn quit_handler(app: &AppHandle) {
    app.get_webview_window("main").unwrap().close().unwrap();
    app.exit(0);
}

fn hide_or_show_handler(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            window.hide().unwrap();
        } else {
            window.show().unwrap();
            window.set_focus().unwrap();
        }
    }
}
