use crate::utils::translator::{Locale, Translator};
use std::{collections::HashMap, sync::Mutex};
use tauri::{AppHandle, Manager, State};

pub struct TranslatorState {
    pub translator: Translator,
}
impl TranslatorState {
    pub fn borrow_from_app(app: &AppHandle) -> Result<State<Mutex<Self>>, String> {
        match app.try_state::<Mutex<Self>>() {
            Some(translator_state) => Ok(translator_state),
            None => Err("Failed to get translator state".to_string()),
        }
    }
}

pub fn initialize_translator(app: &AppHandle) {
    let mut translator = Translator::new(HashMap::new());
    translator.set_locale(Locale::EN);
    app.manage(Mutex::new(TranslatorState { translator }));
}
