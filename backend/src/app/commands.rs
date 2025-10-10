use rust_i18n::t;
use tauri::command;

use crate::utils::translator::Locale;

#[cfg(all(desktop))]
use crate::app::state::MenuState;

#[cfg(all(desktop))]
#[command]
pub fn toggle_locale(app: tauri::AppHandle, locale_string: String) -> Result<(), String> {
    let menu_state_mutex = MenuState::try_borrow_from_app(&app).map_err(|e| e.to_string())?;
    let menu = &mut menu_state_mutex.lock().unwrap().menu;

    let locale = locale_string.parse::<Locale>().map_err(|e| e.to_string())?;

    rust_i18n::set_locale(locale.as_str());

    menu.items().unwrap().iter().for_each(|item| {
        let item = item.as_menuitem().unwrap();
        let id = item.id().as_ref();
        item.set_text(t!(id)).unwrap();
    });

    Ok(())
}
