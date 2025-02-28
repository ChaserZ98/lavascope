mod app;
mod utils;

use app::translator::initialize_translator;
use tauri::{generate_handler, Builder};
use utils::configure_log_builder;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(debug_assertions)]
    {
        std::env::remove_var("HTTP_PROXY");
        std::env::remove_var("http_proxy");
        std::env::remove_var("HTTPS_PROXY");
        std::env::remove_var("https_proxy");
        std::env::remove_var("ALL_PROXY");
        std::env::remove_var("all_proxy");
    }

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
        builder = builder.plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
    }

    builder = builder.setup(|app| {
        initialize_translator(app.handle());

        #[cfg(all(desktop))]
        {
            use app::tray::create_tray;
            let handle = app.handle();
            let _ = create_tray(handle)?;
        }

        Ok(())
    });

    builder = builder.invoke_handler(generate_handler![]);

    #[cfg(all(desktop))]
    {
        use app::commands::toggle_locale;
        builder = builder.invoke_handler(generate_handler![toggle_locale]);
    }

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
