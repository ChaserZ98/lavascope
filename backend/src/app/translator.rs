use crate::{
    app::state::TranslatorState,
    utils::translator::{Locale, Translator},
};
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

pub fn initialize_translator(app: &AppHandle) {
    let mut translator = Translator::new();
    translator.set_locale(Locale::EN);
    app.manage(Mutex::new(TranslatorState { translator }));
}
