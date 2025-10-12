use tauri::{menu::MenuEvent, AppHandle, Manager};

pub fn handle_menu_click(app: &AppHandle, event: MenuEvent) {
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
