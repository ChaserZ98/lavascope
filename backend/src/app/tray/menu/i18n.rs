use std::collections::HashMap;

use crate::utils::translator::{Locale, Translator};

pub fn init_tray_menu_i18n(translator: &mut Translator) {
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
}
