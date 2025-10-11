use std::sync::Mutex;
use tauri::{menu::Menu, AppHandle, Manager, State, Wry};

#[derive(thiserror::Error, Debug)]
pub enum StateError {
    #[error("Failed to get menu state")]
    RetrieveMenuStateFailed,
}

pub struct MenuState {
    pub menu: Menu<Wry>,
}

impl MenuState {
    pub fn try_borrow_from_app(app: &'_ AppHandle) -> Result<State<'_, Mutex<Self>>, StateError> {
        let menu_state = app
            .try_state::<Mutex<Self>>()
            .ok_or(StateError::RetrieveMenuStateFailed)?;
        Ok(menu_state)
    }
}
