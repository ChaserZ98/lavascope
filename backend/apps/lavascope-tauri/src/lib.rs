mod app;

lavascope_i18n::init!();

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = app::AppBuilder::new();

    builder
        .run()
        .expect("error while running tauri application");
}
