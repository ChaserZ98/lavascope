use lavascope_state::MenuStateError;

use crate::event::{TrayIconLeftClickError, TrayIconRightClickError};

#[derive(thiserror::Error, Debug)]
pub enum CreateTrayError {
    #[error(transparent)]
    StateError(#[from] MenuStateError),
    #[error(transparent)]
    TauriError(#[from] tauri::Error),
}

#[derive(thiserror::Error, Debug)]
pub enum TrayIconEventError {
    #[error(transparent)]
    LeftClickError(#[from] TrayIconLeftClickError),
    #[error(transparent)]
    RightClickError(#[from] TrayIconRightClickError),
}
