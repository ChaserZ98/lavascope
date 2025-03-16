// use tauri::{
//     CloseRequestApi, CustomMenuItem, GlobalWindowEvent, Menu, MenuItem, Submenu, WindowEvent,
// };

// pub fn create_window_menu() -> Menu {
//     let quit = CustomMenuItem::new("quit".to_string(), "Quit");
//     let close = CustomMenuItem::new("close".to_string(), "Close");
//     let submenu = Submenu::new("File", Menu::new().add_item(quit).add_item(close));
//     let menu = Menu::new()
//         .add_native_item(MenuItem::Copy)
//         .add_item(CustomMenuItem::new("hide", "Hide"))
//         .add_submenu(submenu);
//     return menu;
// }

// pub fn window_event_handler(event: &GlobalWindowEvent) {
//     match event.event() {
//         WindowEvent::CloseRequested { api, .. } => window_close_event_handler(event, api),
//         _ => {}
//     }
// }

// fn window_close_event_handler(event: &GlobalWindowEvent, api: &CloseRequestApi) {
//     event.window().hide().unwrap();
//     api.prevent_close();
// }
