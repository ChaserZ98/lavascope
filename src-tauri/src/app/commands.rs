use super::{translator::TranslatorState, tray::MenuState};
use crate::utils::translator::Locale;
use tauri::command;

#[command]
pub fn toggle_locale(app: tauri::AppHandle, locale_string: String) -> Result<(), String> {
    let menu_state = match MenuState::borrow_from_app(&app) {
        Ok(menu_state) => menu_state,
        Err(message) => {
            log::error!("{message}");
            return Err(message);
        }
    };
    let menu = &menu_state.menu;

    let translator_state = match TranslatorState::borrow_from_app(&app) {
        Ok(translator_state) => translator_state,
        Err(message) => {
            log::error!("{message}");
            return Err(message);
        }
    };
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
