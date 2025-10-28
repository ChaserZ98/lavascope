use std::sync::Mutex;

use tauri::{AppHandle, Manager, State};

#[derive(thiserror::Error, Debug)]
pub enum WindowStateError {
    #[error("Failed to get window state")]
    RetrieveWindowStateFailed,
}

pub struct WindowState {
    pub is_first_close_event: bool,
}

impl Default for WindowState {
    fn default() -> Self {
        Self {
            is_first_close_event: true,
        }
    }
}

impl WindowState {
    pub fn try_borrow_from_app(
        app: &'_ AppHandle,
    ) -> Result<State<'_, Mutex<Self>>, WindowStateError> {
        let menu_state = app
            .try_state::<Mutex<Self>>()
            .ok_or(WindowStateError::RetrieveWindowStateFailed)?;
        Ok(menu_state)
    }
}
