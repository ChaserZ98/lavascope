import json
import subprocess
import tomllib
from dataclasses import dataclass

from .path_const import APP_WEB_DIR, BACKEND_TAURI_DIR, ROOT_DIR

ui_manifest_path = APP_WEB_DIR.joinpath("package.json")
cargo_manifest_path = BACKEND_TAURI_DIR.joinpath("Cargo.toml")
tauri_config_path = BACKEND_TAURI_DIR.joinpath("tauri.conf.json")


def get_cargo_package_version() -> str:
    with open(cargo_manifest_path, "r") as f:
        cargo_manifest = tomllib.loads(f.read())
    return cargo_manifest["package"]["version"]


def get_ui_version() -> str:
    with open(ui_manifest_path, "r") as f:
        ui_manifest = json.loads(f.read())
    return ui_manifest["version"]


def get_tauri_config_version() -> str:
    with open(tauri_config_path, "r") as f:
        tauri_config = json.loads(f.read())
    return tauri_config["version"]


def get_git_commit_hash() -> str:
    return subprocess.check_output(["git", "rev-parse", "HEAD"]).decode("utf-8").strip()


@dataclass
class BuildInfo:
    ui_version: str = get_ui_version()
    cargo_package_version: str = get_cargo_package_version()
    tauri_config_version: str = get_tauri_config_version()
    git_commit_hash: str = get_git_commit_hash()

    def dump(self):
        return {
            "ui_version": self.ui_version,
            "cargo_package_version": self.cargo_package_version,
            "tauri_config_version": self.tauri_config_version,
            "git_commit_hash": self.git_commit_hash,
        }

    def save_to_file(self, path=None):
        if not path:
            path = self.default_path()

        with open(path, "w") as f:
            json.dump(self.dump(), f, indent=4)

        return path

    def default_path(self):
        return ROOT_DIR.joinpath("build-info.json")
