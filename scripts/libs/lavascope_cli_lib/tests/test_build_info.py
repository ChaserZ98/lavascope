from dataclasses import dataclass
from typing import Any
from unittest import mock

import pytest
from lavascope_cli_lib.build_info import (
    BuildInfo,
    backend_cargo_manifest_path,
    frontend_package_manifest_path,
    get_app_version,
    get_backend_version,
    get_frontend_version,
    get_git_commit_hash,
    tauri_config_path,
)


@pytest.fixture
def mock_open(mocker):
    return mocker.patch("builtins.open", new_callable=mock.mock_open)


@pytest.fixture
def mock_subprocess_check_output(mocker):
    return mocker.patch("subprocess.check_output")


@pytest.fixture
def mock_json_dump(mocker):
    return mocker.patch("json.dump")


@dataclass
class MockBuildInfoModule:
    tauri_config_path: Any
    root_dir: Any


@pytest.fixture
def mock_build_info_module(mocker, request):
    tauri_config_path = mocker.patch("lavascope_cli_lib.build_info.tauri_config_path")
    root_dir = mocker.patch("lavascope_cli_lib.build_info.ROOT_DIR")

    return MockBuildInfoModule(tauri_config_path, root_dir)


@pytest.fixture
def mock_build_info_default_path(mocker):
    return mocker.patch("lavascope_cli_lib.build_info.BuildInfo.default_path")


def test_ui_path():
    assert frontend_package_manifest_path.exists(), (
        f"{frontend_package_manifest_path} does not exist"
    )
    assert frontend_package_manifest_path.is_file(), (
        f"{frontend_package_manifest_path} is not a file"
    )
    assert (
        frontend_package_manifest_path.parent.name == "web"
        and frontend_package_manifest_path.parent.parent.name == "apps"
        and frontend_package_manifest_path.parent.parent.parent.name == "frontend"
    ), f"{frontend_package_manifest_path} is not in the correct directory"


def test_cargo_path():
    assert backend_cargo_manifest_path.exists(), (
        f"{backend_cargo_manifest_path} does not exist"
    )
    assert backend_cargo_manifest_path.is_file(), (
        f"{backend_cargo_manifest_path} is not a file"
    )
    assert backend_cargo_manifest_path.parent.name == "lavascope-tauri", (
        f"{backend_cargo_manifest_path} is not in the correct directory"
    )


def test_tauri_config_path():
    assert tauri_config_path.exists(), f"{tauri_config_path} does not exist"
    assert tauri_config_path.is_file(), f"{tauri_config_path} is not a file"
    assert tauri_config_path.parent.name == "lavascope-tauri", (
        f"{tauri_config_path} is not in the correct directory"
    )


def test_cargo_package_version(mock_open):
    mock_open.return_value.read.return_value = """\
        [package]
        name = "lavascope-tauri"
        version = "0.1.0"
        """

    assert get_backend_version() == "0.1.0"


def test_get_ui_version(mock_open):
    mock_open.return_value.read.return_value = """\
        {
            "name": "@lavascope/web",
            "version": "0.1.0"
        }
        """

    assert get_frontend_version() == "0.1.0"


def test_get_tauri_config_version(mock_build_info_module, mock_open):
    mock_open.return_value.read.return_value = """\
        {
            "productName": "LavaScope",
            "version": "0.1.0"
        }
        """

    version = get_app_version()

    mock_open.assert_called_once_with(mock_build_info_module.tauri_config_path, "r")
    assert version == "0.1.0"


def test_get_commit_hash(mock_subprocess_check_output):
    expected_hash = "1234567890abcdef"
    mock_subprocess_check_output.return_value = expected_hash.encode("utf-8")

    res = get_git_commit_hash()

    mock_subprocess_check_output.assert_called_once_with(["git", "rev-parse", "HEAD"])
    assert res == expected_hash, f"{res} != {expected_hash}"


def test_build_info_dump():
    frontend_version = "0.1.0"
    backend_version = "0.1.1"
    app_version = "0.1.2"
    git_commit_hash = "1234567890abcdef"
    build_date = "date"
    expected_dump_res = {
        "frontend_version": frontend_version,
        "backend_version": backend_version,
        "app_version": app_version,
        "git_commit_hash": git_commit_hash,
        "build_date": build_date,
    }

    build_info = BuildInfo(
        app_version=app_version,
        frontend_version=frontend_version,
        backend_version=backend_version,
        git_commit_hash=git_commit_hash,
        build_date=build_date,
    )
    res = build_info.dump()

    assert res == expected_dump_res, f"{res} != {expected_dump_res}"


def test_build_info_save_to_file(
    mocker,
    mock_build_info_module,
    mock_open,
    mock_json_dump,
    mock_build_info_default_path,
):
    build_info = BuildInfo("0.1.0", "0.1.1", "0.1.2", "1234567890abcdef", "date")

    build_info.save_to_file()

    mock_open.assert_called_once_with(mock_build_info_default_path(), "w")
    mock_open_handle = mock_open()
    mock_json_dump.assert_called_once_with(
        {
            "app_version": "0.1.0",
            "frontend_version": "0.1.1",
            "backend_version": "0.1.2",
            "git_commit_hash": "1234567890abcdef",
            "build_date": "date",
        },
        mock_open_handle,
        indent=4,
    )


def test_build_info_default_path(mock_build_info_module):
    expected_path = "/path/to/root/build-info.json"
    mock_build_info_module.root_dir.joinpath.return_value = expected_path

    build_info = BuildInfo()
    res = build_info.default_path()

    assert res == expected_path, f"{res} != {expected_path}"
