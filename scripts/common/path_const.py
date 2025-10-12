from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent.parent

FRONTEND_DIR = ROOT_DIR.joinpath("frontend")
APP_UI_DIR = FRONTEND_DIR.joinpath("apps", "ui")

BACKEND_DIR = ROOT_DIR.joinpath("backend")
BACKEND_TAURI_DIR = BACKEND_DIR.joinpath("lavascope-tauri")
ANDROID_DIR = BACKEND_TAURI_DIR.joinpath("gen", "android")
