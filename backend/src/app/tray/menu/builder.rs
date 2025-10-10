use rust_i18n::t;
use tauri::{
    menu::{Menu, MenuItem},
    AppHandle, Wry,
};

use crate::app::tray::error::CreateTrayError;

pub struct TrayIconMenuBuilder {}

impl TrayIconMenuBuilder {
    pub fn build(app: &AppHandle) -> Result<Menu<Wry>, CreateTrayError> {
        let hide_or_show = MenuItem::with_id(app, "Hide", t!("Hide"), true, None::<&str>)?;
        let quit = MenuItem::with_id(app, "Quit", t!("Quit"), true, None::<&str>)?;

        let menu_items: Vec<&dyn tauri::menu::IsMenuItem<Wry>> = vec![&hide_or_show, &quit];
        let menu = Menu::with_id_and_items(app, "tray-menu", &menu_items)?;

        Ok(menu)
    }
}
