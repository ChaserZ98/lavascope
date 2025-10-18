from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent.parent.parent.parent.parent

FRONTEND_DIR = ROOT_DIR.joinpath("frontend")
APP_WEB_DIR = FRONTEND_DIR.joinpath("apps", "web")

BACKEND_DIR = ROOT_DIR.joinpath("backend")
BACKEND_TAURI_DIR = BACKEND_DIR.joinpath("apps", "lavascope-tauri")
ANDROID_DIR = BACKEND_TAURI_DIR.joinpath("gen", "android")
