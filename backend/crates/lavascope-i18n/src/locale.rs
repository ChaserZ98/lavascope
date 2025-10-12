use std::{fmt::Display, str::FromStr};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParseLocaleError {
    message: String,
}

impl Display for ParseLocaleError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.message)
    }
}

#[derive(Debug, Hash, Eq, PartialEq, Clone, Copy)]
pub enum Locale {
    EN,
    ZH,
    ZhHant,
}

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
