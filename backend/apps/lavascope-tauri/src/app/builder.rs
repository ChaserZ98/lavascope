use lavascope_logging::LogBuilder;
use tauri::{Builder, RunEvent, WindowEvent, Wry, generate_context, generate_handler};

use crate::app::{MAIN_WINDOW_LABEL, event_handler::WindowCloseEventError};

use super::{commands, event_handler};

#[derive(thiserror::Error, Debug)]
pub enum RunEventError {
    #[cfg(target_os = "macos")]
    #[error(transparent)]
    ReopenEvent(#[from] super::event_handler::ReopenEventError),
    #[error(transparent)]
    WindowCloseEvent(#[from] WindowCloseEventError),
}

pub struct AppBuilder(Builder<Wry>);

impl AppBuilder {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn run(self) -> Result<(), tauri::Error> {
        let app = self.0.build(generate_context!())?;

        app.run(|app, event| {
            let res: Result<(), RunEventError> = match event {
                #[cfg(target_os = "macos")]
                RunEvent::Reopen {
                    has_visible_windows,
                    ..
                } => event_handler::handle_reopen(app, has_visible_windows)
                    .map_err(RunEventError::from),
                RunEvent::WindowEvent { label, event, .. } => {
                    if label != MAIN_WINDOW_LABEL {
                        return;
                    }
                    match event {
                        WindowEvent::CloseRequested { api, .. } => {
                            event_handler::handle_window_close(app, api).map_err(|e| e.into())
                        }
                        _ => Ok(()),
                    }
                }
                _ => Ok(()),
            };

            if let Err(e) = res {
                log::error!("{e}");
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

                    let window = app.get_webview_window(MAIN_WINDOW_LABEL).unwrap();
                    let _ = window.show();
                    let _ = window.set_focus();
                }))
        }

        builder = builder.setup(|app| {
            #[cfg(all(desktop))]
            {
                use lavascope_state::WindowState;
                use lavascope_tray::TrayIconBuilder;
                use tauri::Manager;
                let app_handle = app.handle();
                TrayIconBuilder::build(&app_handle).unwrap();

                let window_state = WindowState::new(MAIN_WINDOW_LABEL);
                app_handle.manage(window_state);
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
