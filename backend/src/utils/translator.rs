use std::collections::HashMap;

#[derive(Hash, Eq, PartialEq, Clone)]
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

#[derive(Debug)]
#[allow(dead_code)]
pub struct ParseLocaleError {
    message: String,
}

impl std::str::FromStr for Locale {
    type Err = ParseLocaleError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            s if s == Locale::EN.as_str() => Ok(Locale::EN),
            s if s == Locale::ZH.as_str() => Ok(Locale::ZH),
            s if s == Locale::ZhHant.as_str() => Ok(Locale::ZhHant),
            _ => Err(ParseLocaleError {
                message: format!("Invalid locale string `{s}`"),
            }),
        }
    }
}

pub struct Translator {
    locale: Option<Locale>,
    messages: HashMap<String, HashMap<Locale, String>>,
}

#[allow(dead_code)]
impl Translator {
    pub fn new(messages: HashMap<String, HashMap<Locale, String>>) -> Self {
        Self {
            locale: None,
            messages,
        }
    }
    /**
       Translate a string to the current locale if it exists in the messages.
       # Arguments
       * `value` - The string to translate
       # Returns
       An `Option` wrapping the translated string if there is a match, otherwise `None`
    */
    pub fn try_translate(&self, value: &str) -> Option<String> {
        if self.locale.is_none() || !self.messages.contains_key(value) {
            return None;
        }
        let message = self.messages.get(value).unwrap();
        let locale = self.locale.as_ref().unwrap();

        if !message.contains_key(locale) {
            return None;
        }
        let translation = message.get(locale);
        translation.cloned()
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
        self.locale.clone()
    }
    pub fn insert_message(&mut self, text: String, message: HashMap<Locale, String>) {
        self.messages.insert(text, message);
    }
}
