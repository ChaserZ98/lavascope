import json
import subprocess
import tomllib
from dataclasses import dataclass
from datetime import datetime, timezone

from .path_const import APP_WEB_DIR, BACKEND_TAURI_DIR, ROOT_DIR

frontend_package_manifest_path = APP_WEB_DIR.joinpath("package.json")
backend_cargo_manifest_path = BACKEND_TAURI_DIR.joinpath("Cargo.toml")
tauri_config_path = BACKEND_TAURI_DIR.joinpath("tauri.conf.json")


def get_app_version() -> str:
    with open(tauri_config_path, "r") as f:
        tauri_config = json.loads(f.read())
    return tauri_config["version"]


def get_backend_version() -> str:
    with open(backend_cargo_manifest_path, "r") as f:
        cargo_manifest = tomllib.loads(f.read())
    return cargo_manifest["package"]["version"]


def get_frontend_version() -> str:
    with open(frontend_package_manifest_path, "r") as f:
        ui_manifest = json.loads(f.read())
    return ui_manifest["version"]


def get_git_commit_hash() -> str:
    return subprocess.check_output(["git", "rev-parse", "HEAD"]).decode("utf-8").strip()


def get_build_date() -> str:
    current_datetime = datetime.now(timezone.utc)
    return current_datetime.isoformat()


@dataclass
class BuildInfo:
    app_version: str = get_app_version()
    frontend_version: str = get_frontend_version()
    backend_version: str = get_backend_version()
    git_commit_hash: str = get_git_commit_hash()
    build_date: str = get_build_date()

    def dump(self):
        return {
            "app_version": self.app_version,
            "frontend_version": self.frontend_version,
            "backend_version": self.backend_version,
            "git_commit_hash": self.git_commit_hash,
            "build_date": self.build_date,
        }

    def save_to_file(self, path=None):
        if not path:
            path = self.default_path()

        with open(path, "w") as f:
            json.dump(self.dump(), f, indent=4)

        return path

    def default_path(self):
        return ROOT_DIR.joinpath("build-info.json")
