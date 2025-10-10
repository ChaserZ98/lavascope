use std::{collections::HashMap, fmt::Display, str::FromStr};

#[derive(Debug, Clone, PartialEq, Eq)]
#[allow(dead_code)]
pub struct ParseLocaleError {
    message: String,
}

#[derive(Debug, Hash, Eq, PartialEq, Clone, Copy)]
pub enum Locale {
    EN,
    ZH,
    ZhHant,
}

#[allow(dead_code)]
impl Locale {
    pub fn as_str(&self) -> &str {
        match self {
            Self::EN => "en",
            Self::ZH => "zh",
            Self::ZhHant => "zh-Hant",
        }
    }
}

impl FromStr for Locale {
    type Err = ParseLocaleError;
    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value {
            "en" => Ok(Locale::EN),
            "zh" => Ok(Locale::ZH),
            "zh-Hant" => Ok(Locale::ZhHant),
            _ => Err(ParseLocaleError {
                message: format!("Invalid locale string `{value}`"),
            }),
        }
    }
}

impl Display for Locale {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

#[derive(thiserror::Error, Debug)]
pub enum TranslatorError {
    #[error("Locale of the translator is not set")]
    LocaleNotSet,
    #[error("`{0}` is not in the dictionary")]
    NotInDictionary(String),
    #[error("No match locale string for `{0}` with locale `{1}`")]
    NoMatchLocale(String, Locale),
}

pub struct Translator {
    locale: Option<Locale>,
    messages: HashMap<String, HashMap<Locale, String>>,
}

#[allow(dead_code)]
impl Translator {
    pub fn new() -> Self {
        Self {
            locale: None,
            messages: HashMap::new(),
        }
    }
    /**
       Translate a string to the current locale if it exists in the messages.
       # Arguments
       * `value` - The string to translate
       # Returns
       An `Option` wrapping the translated string if there is a match, otherwise `None`
    */
    pub fn try_translate(&self, value: &str) -> Result<String, TranslatorError> {
        let locale = self.locale.ok_or(TranslatorError::LocaleNotSet)?;

        let message = self
            .messages
            .get(value)
            .ok_or(TranslatorError::NotInDictionary(value.to_string()))?;

        let translation = message
            .get(&locale)
            .ok_or(TranslatorError::NoMatchLocale(value.to_string(), locale))?;

        Ok(translation.clone())
    }
    /**
       Translate a string to the current locale if it exists in the messages, otherwise return the default value.

       Note: If the default value is not provided, the default value will fallback to the provided value.
       # Arguments
       * `value` - The string to translate
       * `default` - The default value to return if the translation is not found
       # Returns
       The translated string if it exists in the messages, otherwise the default value
    */
    pub fn translate_with_default(&self, value: &str, default: &str) -> String {
        self.try_translate(value).unwrap_or(default.to_string())
    }
    /**
        Translate a string to the current locale if it exists in the messages, otherwise fallback to the provided value.
        # Arguments
        * `value` - The string to translate
        # Returns
        The translated string if it exists in the messages, otherwise fallback to the provided value.
    */
    pub fn translate_or(&self, value: &str) -> String {
        self.try_translate(value).unwrap_or(value.to_string())
    }
    pub fn set_locale(&mut self, locale: Locale) {
        self.locale = Some(locale);
    }
    pub fn get_locale(&self) -> Option<Locale> {
        self.locale
    }
    pub fn insert_message(&mut self, text: String, message: HashMap<Locale, String>) {
        self.messages.insert(text, message);
    }
}

impl From<HashMap<String, HashMap<Locale, String>>> for Translator {
    fn from(messages: HashMap<String, HashMap<Locale, String>>) -> Self {
        Self {
            locale: None,
            messages,
        }
    }
}
