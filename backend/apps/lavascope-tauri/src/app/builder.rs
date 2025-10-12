use lavascope_logging::LogBuilder;
use tauri::{Builder, Wry, generate_context, generate_handler};

use super::commands;

pub struct AppBuilder(Builder<Wry>);

impl AppBuilder {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn run(self) -> Result<(), tauri::Error> {
        let app = self.0.build(generate_context!())?;

        #[allow(unused_variables)]
        app.run(|_app, event| {
            // workaround for macos single instance reopen issue
            // see details https://github.com/tauri-apps/plugins-workspace/issues/1613#issuecomment-2454134194
            #[cfg(target_os = "macos")]
            {
                use tauri::{Manager, RunEvent};

                match event {
                    RunEvent::Reopen { .. } => {
                        let main_window = _app.get_webview_window("main").unwrap();
                        let _ = main_window.show();
                        let _ = main_window.set_focus();
                    }
                    _ => {}
                }
            }
        });

        Ok(())
    }
}

impl Default for AppBuilder {
    fn default() -> Self {
        let mut builder = Builder::default();

        builder = builder
            .plugin(tauri_plugin_shell::init())
            .plugin(tauri_plugin_os::init())
            .plugin(LogBuilder::new().build())
            .plugin(tauri_plugin_notification::init())
            .plugin(tauri_plugin_http::init())
            .plugin(tauri_plugin_clipboard_manager::init());

        #[cfg(all(desktop))]
        {
            builder = builder
                .plugin(tauri_plugin_autostart::init(
                    tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                    None,
                ))
                .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
                    use tauri::Manager;

                    let main_window = app.get_webview_window("main").unwrap();
                    let _ = main_window.show();
                    let _ = main_window.set_focus();
                }))
        }

        builder = builder.setup(|app| {
            #[cfg(all(desktop))]
            {
                use lavascope_tray::TrayIconBuilder;
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
