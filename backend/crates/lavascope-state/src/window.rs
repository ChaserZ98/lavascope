use std::sync::Mutex;

use tauri::{AppHandle, Manager, State};

#[derive(thiserror::Error, Debug)]
pub enum WindowStateError {
    #[error("Failed to get window state")]
    RetrieveWindowStateFailed,
}

pub struct WindowState {
    pub is_first_close_event: Mutex<bool>,
    pub main_window_label: &'static str,
}

impl WindowState {
    pub fn new(main_window_label: &'static str) -> Self {
        let mut state = Self::default();
        state.main_window_label = main_window_label;
        state
    }
    pub fn try_borrow_from_app(app: &'_ AppHandle) -> Result<State<'_, Self>, WindowStateError> {
        let menu_state = app
            .try_state::<Self>()
            .ok_or(WindowStateError::RetrieveWindowStateFailed)?;
        Ok(menu_state)
    }
}

impl Default for WindowState {
    fn default() -> Self {
        Self {
            is_first_close_event: Mutex::new(true),
            main_window_label: "main",
        }
    }
}
