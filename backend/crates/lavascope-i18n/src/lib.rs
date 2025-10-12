mod backend;
mod locale;

pub use backend::I18nBackend;
pub use locale::*;

#[macro_export]
macro_rules! init {
    () => {
        rust_i18n::i18n!(backend = lavascope_i18n::I18nBackend);
    };
}

pub use rust_i18n::{available_locales, set_locale, t};
