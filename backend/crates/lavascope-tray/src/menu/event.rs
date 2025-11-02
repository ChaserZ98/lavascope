use lavascope_state::{WindowState, WindowStateError};
use tauri::{AppHandle, Manager, menu::MenuEvent};

#[derive(thiserror::Error, Debug)]
pub enum TrayMenuEventError<'a> {
    #[error("Unknown menu item with id {0}")]
    UnknownMenuId(&'a str),
    #[error("Failed to handle hide/show event: {0}")]
    HideShowEvent(#[from] HideShowError),
}

pub fn handle_menu_click(app: &AppHandle, event: MenuEvent) {
    let menu_id = event.id.as_ref();
    let res: Result<(), TrayMenuEventError> = match menu_id {
        "Quit" => {
            handle_quit(app);
            Ok(())
        }
        "Hide" => handle_hide_or_show(app).map_err(TrayMenuEventError::from),
        _ => Err(TrayMenuEventError::UnknownMenuId(menu_id)),
    };
    if let Err(e) = res {
        log::error!("Failed to handle menu click: {e}");
    }
}

fn handle_quit(app: &AppHandle) {
    app.exit(0);
}

#[derive(thiserror::Error, Debug)]
pub enum HideShowError {
    #[error("Failed to get window state")]
    GetWindowState(#[from] WindowStateError),
    #[error("Failed to get window with label: {0}")]
    GetWindow(&'static str),
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
}

fn handle_hide_or_show(app: &AppHandle) -> Result<(), HideShowError> {
    let window_state = WindowState::try_borrow_from_app(app)?;
    let main_window_label = window_state.main_window_label;
    let window = app
        .get_webview_window(main_window_label)
        .ok_or(HideShowError::GetWindow(main_window_label))?;
    if window.is_visible().unwrap_or(false) {
        window.hide()?;
    } else {
        window.show()?;
        window.set_focus()?;
    }

    Ok(())
}
