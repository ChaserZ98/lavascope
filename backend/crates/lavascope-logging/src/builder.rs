use tauri::{Runtime, plugin::TauriPlugin};
use tauri_plugin_log::{Builder, Target, TargetKind, TimezoneStrategy};

pub struct LogBuilder(Builder);

impl LogBuilder {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn build<R>(self) -> TauriPlugin<R>
    where
        R: Runtime,
    {
        self.0.build()
    }
}

impl Default for LogBuilder {
    fn default() -> Self {
        let mut builder = Builder::new();

        // local time may broken on macos and causing the dispatcher to reset to default
        builder = builder.timezone_strategy(TimezoneStrategy::UseLocal);

        builder = builder
            .targets([
                Target::new(TargetKind::Stdout),
                Target::new(TargetKind::LogDir {
                    file_name: Some(String::from("app")),
                }),
            ])
            .max_file_size(50_000 /* bytes */);

        #[cfg(debug_assertions)]
        {
            builder = builder.level(log::LevelFilter::Debug);
        }

        #[cfg(not(debug_assertions))]
        {
            builder = builder.level(log::LevelFilter::Info);
        }

        Self(builder)
    }
}
