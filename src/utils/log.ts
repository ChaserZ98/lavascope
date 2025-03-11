import { isTauri } from "@tauri-apps/api/core";
import { debug, error, info, warn } from "@tauri-apps/plugin-log";

enum LogLevel {
    TRACE = 0,
    DEBUG = 10,
    INFO = 20,
    WARN = 30,
    ERROR = 40,
    CRITICAL = 50,
}

type Log = {
    trace: (msg: string) => void;
    debug: (msg: string) => void;
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
};

function forwardLog(
    level: "error" | "warn" | "info" | "debug" | "log",
    frontEndLogLevel: LogLevel = import.meta.env.PROD
        ? LogLevel.WARN
        : LogLevel.DEBUG,
    tauriLogLevel: LogLevel = import.meta.env.PROD
        ? LogLevel.INFO
        : LogLevel.DEBUG
) {
    switch (level) {
        case "debug": {
            const frontEndLogger =
                frontEndLogLevel > LogLevel.DEBUG ? () => {} : console.debug;
            const tauriLogger =
                tauriLogLevel > LogLevel.DEBUG ? () => {} : debug;
            return (msg: string) => {
                frontEndLogger(msg);
                tauriLogger(msg);
            };
        }
        case "info": {
            const frontEndLogger =
                frontEndLogLevel > LogLevel.INFO ? () => {} : console.info;
            const tauriLogger = tauriLogLevel > LogLevel.INFO ? () => {} : info;
            return (msg: string) => {
                frontEndLogger(msg);
                tauriLogger(msg);
            };
        }
        case "warn": {
            const frontEndLogger =
                frontEndLogLevel > LogLevel.WARN ? () => {} : console.warn;
            const tauriLogger = tauriLogLevel > LogLevel.WARN ? () => {} : warn;
            return (msg: string) => {
                frontEndLogger(msg);
                tauriLogger(msg);
            };
        }
        case "error": {
            const frontEndLogger =
                frontEndLogLevel > LogLevel.ERROR ? () => {} : console.error;
            const tauriLogger =
                tauriLogLevel > LogLevel.ERROR ? () => {} : error;
            return (msg: string) => {
                frontEndLogger(msg);
                tauriLogger(msg);
            };
        }
        case "log": {
            const frontEndLogger =
                frontEndLogLevel > LogLevel.INFO ? () => {} : console.log;
            const tauriLogger = tauriLogLevel > LogLevel.INFO ? () => {} : info;
            return (msg: string) => {
                frontEndLogger(msg);
                tauriLogger(msg);
            };
        }
    }
}

// const tauriLogLevel = import.meta.env.PROD ? LogLevel.INFO : LogLevel.DEBUG;
// const frontEndLogLevel = import.meta.env.PROD ? LogLevel.WARN : LogLevel.DEBUG;

const tauriLogLevel = LogLevel.INFO;
const frontEndLogLevel = LogLevel.WARN;

const logging: Log = isTauri()
    ? {
          error: forwardLog("error", frontEndLogLevel, tauriLogLevel),
          warn: forwardLog("warn", frontEndLogLevel, tauriLogLevel),
          info: forwardLog("info", frontEndLogLevel, tauriLogLevel),
          debug: forwardLog("debug", frontEndLogLevel, tauriLogLevel),
          trace: forwardLog("log", frontEndLogLevel, tauriLogLevel),
      }
    : {
          error: frontEndLogLevel > LogLevel.ERROR ? () => {} : console.error,
          warn: frontEndLogLevel > LogLevel.WARN ? () => {} : console.warn,
          info: frontEndLogLevel > LogLevel.INFO ? () => {} : console.info,
          debug: frontEndLogLevel > LogLevel.DEBUG ? () => {} : console.debug,
          trace: frontEndLogLevel > LogLevel.TRACE ? () => {} : console.trace,
      };

export default logging;
