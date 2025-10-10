pub mod event;
pub mod i18n;

use crate::{app::tray::error::CreateTrayError, utils::translator::Translator};
use tauri::{
    menu::{Menu, MenuItem},
    AppHandle, Wry,
};

pub fn create_tray_menu(
    app: &AppHandle,
    translator: &Translator,
) -> Result<Menu<Wry>, CreateTrayError> {
    let hide_or_show = MenuItem::with_id(
        app,
        "Hide",
        translator.translate_or("Hide"),
        true,
        None::<&str>,
    )?;
    let quit = MenuItem::with_id(
        app,
        "Quit",
        translator.translate_or("Quit"),
        true,
        None::<&str>,
    )?;

    let menu_items: Vec<&dyn tauri::menu::IsMenuItem<Wry>> = vec![&hide_or_show, &quit];
    let menu = Menu::with_id_and_items(app, "tray-menu", &menu_items)?;

    Ok(menu)
}
