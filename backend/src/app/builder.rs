use tauri::{generate_context, generate_handler, Builder, Wry};

use super::commands;
use crate::utils::configure_log_builder;

pub struct AppBuilder(Builder<Wry>);

impl AppBuilder {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn run(self) -> Result<(), tauri::Error> {
        self.0.run(generate_context!())
    }
}

impl Default for AppBuilder {
    fn default() -> Self {
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
            #[cfg(all(desktop))]
            {
                use crate::app::tray::TrayIconBuilder;
                let app_handle = app.handle();
                TrayIconBuilder::build(&app_handle).unwrap();
            }

            Ok(())
        });

        builder = builder.invoke_handler(generate_handler![]);

        #[cfg(all(desktop))]
        {
            builder = builder.invoke_handler(generate_handler![commands::toggle_locale]);
        }

        Self(builder)
    }
}
