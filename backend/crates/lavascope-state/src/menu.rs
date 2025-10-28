use std::sync::Mutex;
use tauri::{AppHandle, Manager, State, Wry, menu::Menu};

#[derive(thiserror::Error, Debug)]
pub enum MenuStateError {
    #[error("Failed to get menu state")]
    RetrieveMenuStateFailed,
}

pub struct MenuState {
    pub menu: Menu<Wry>,
}

impl MenuState {
    pub fn try_borrow_from_app(
        app: &'_ AppHandle,
    ) -> Result<State<'_, Mutex<Self>>, MenuStateError> {
        let menu_state = app
            .try_state::<Mutex<Self>>()
            .ok_or(MenuStateError::RetrieveMenuStateFailed)?;
        Ok(menu_state)
    }
}
