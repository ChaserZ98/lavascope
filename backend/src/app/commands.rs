use crate::{app::state::TranslatorState, utils::translator::Locale};
use tauri::command;

#[cfg(all(desktop))]
use super::state::MenuState;

#[cfg(all(desktop))]
#[command]
pub fn toggle_locale(app: tauri::AppHandle, locale_string: String) -> Result<(), String> {
    let menu_state = MenuState::try_borrow_from_app(&app).map_err(|e| {
        log::error!("{e}");
        e.to_string()
    })?;
    let menu = &mut menu_state.lock().unwrap().menu;

    let translator_state = TranslatorState::try_borrow_from_app(&app).map_err(|e| {
        log::error!("{e}");
        e.to_string()
    })?;
    let translator = &mut translator_state.lock().unwrap().translator;

    let locale = match locale_string.parse::<Locale>() {
        Ok(locale) => locale,
        Err(_) => return Err("Failed to parse locale".to_string()),
    };

    translator.set_locale(locale);
    menu.items().unwrap().iter().for_each(|item| {
        let item = item.as_menuitem().unwrap();
        let id = item.id().as_ref();
        let text = item.text().unwrap();
        let _ = item.set_text(translator.translate_with_default(id, text.as_str()));
    });

    Ok(())
}
