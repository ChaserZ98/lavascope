// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use tauri::Builder;

mod app;
use app::logging::configure_log_builder;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    std::env::remove_var("HTTP_PROXY");
    std::env::remove_var("http_proxy");
    std::env::remove_var("HTTPS_PROXY");
    std::env::remove_var("https_proxy");
    std::env::remove_var("ALL_PROXY");
    std::env::remove_var("all_proxy");

    let mut builder = Builder::default();

    builder = builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .plugin(configure_log_builder().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_clipboard_manager::init());

    #[cfg(all(desktop))]
    {
        builder = builder.setup(|app| {
            use app::tray::create_tray;
            let handle = app.handle();
            let _ = create_tray(handle)?;
            Ok(())
        });
        builder = builder.plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
    }

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
