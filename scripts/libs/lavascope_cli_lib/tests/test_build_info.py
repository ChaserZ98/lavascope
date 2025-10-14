from unittest.mock import mock_open

from lavascope_cli_lib.build_info import (
    BuildInfo,
    cargo_manifest_path,
    get_cargo_package_version,
    get_git_commit_hash,
    get_tauri_config_version,
    get_ui_version,
    tauri_config_path,
    ui_manifest_path,
)


def test_ui_path():
    assert ui_manifest_path.exists(), f"{ui_manifest_path} does not exist"
    assert ui_manifest_path.is_file(), f"{ui_manifest_path} is not a file"
    assert (
        ui_manifest_path.parent.name == "ui"
        and ui_manifest_path.parent.parent.name == "apps"
        and ui_manifest_path.parent.parent.parent.name == "frontend"
    ), f"{ui_manifest_path} is not in the correct directory"


def test_cargo_path():
    assert cargo_manifest_path.exists(), f"{cargo_manifest_path} does not exist"
    assert cargo_manifest_path.is_file(), f"{cargo_manifest_path} is not a file"
    assert cargo_manifest_path.parent.name == "lavascope-tauri", (
        f"{cargo_manifest_path} is not in the correct directory"
    )


def test_tauri_config_path():
    assert tauri_config_path.exists(), f"{tauri_config_path} does not exist"
    assert tauri_config_path.is_file(), f"{tauri_config_path} is not a file"
    assert tauri_config_path.parent.name == "lavascope-tauri", (
        f"{tauri_config_path} is not in the correct directory"
    )


def test_cargo_package_version(mocker):
    mocker.patch(
        "builtins.open",
        mock_open(
            read_data="""\
            [package]
            name = "lavascope-tauri"
            version = "0.1.0"
            edit = "2024"
            """
        ),
    )
    assert get_cargo_package_version() == "0.1.0"


def test_get_ui_version(mocker):
    mocked_open = mock_open(
        read_data="""\
        {
        "name": "@lavascope/ui",
        "version": "0.1.0"
        }
        """
    )
    mocker.patch("builtins.open", mocked_open)

    assert get_ui_version() == "0.1.0"


def test_get_tauri_config_version(mocker):
    mocked_open = mock_open(
        read_data="""\
        {
            "productName": "LavaScope",
            "version": "0.1.0"
        }
        """
    )
    mocker.patch("builtins.open", mocked_open)
    mocked_tauri_config_path = mocker.patch(
        "lavascope_cli_lib.build_info.tauri_config_path"
    )

    version = get_tauri_config_version()

    mocked_open.assert_called_once_with(mocked_tauri_config_path, "r")
    assert version == "0.1.0"


def test_get_commit_hash(mocker):
    expected_hash = "1234567890abcdef"
    mocked_subprocess_check_output = mocker.patch(
        "lavascope_cli_lib.build_info.subprocess.check_output"
    )
    mocked_subprocess_check_output.return_value = expected_hash.encode("utf-8")

    res = get_git_commit_hash()

    mocked_subprocess_check_output.assert_called_once_with(["git", "rev-parse", "HEAD"])
    assert res == get_git_commit_hash(), f"{res} != {expected_hash}"


def test_build_info_dump(mocker):
    ui_version = "0.1.0"
    cargo_package_version = "0.1.1"
    tauri_config_version = "0.1.2"
    git_commit_hash = "1234567890abcdef"
    expected_dump_res = {
        "ui_version": ui_version,
        "cargo_package_version": cargo_package_version,
        "tauri_config_version": tauri_config_version,
        "git_commit_hash": git_commit_hash,
    }

    build_info = BuildInfo(
        ui_version=ui_version,
        cargo_package_version=cargo_package_version,
        tauri_config_version=tauri_config_version,
        git_commit_hash=git_commit_hash,
    )
    res = build_info.dump()

    assert res == expected_dump_res, f"{res} != {expected_dump_res}"


def test_build_info_save_to_file(mocker):
    mocked_default_path = mocker.patch(
        "lavascope_cli_lib.build_info.BuildInfo.default_path"
    )
    mocked_open = mocker.patch("builtins.open", mock_open())
    mocked_json_dump = mocker.patch("lavascope_cli_lib.build_info.json.dump")

    build_info = BuildInfo("0.1.0", "0.1.1", "0.1.2", "1234567890abcdef")

    build_info.save_to_file()

    mocked_open.assert_called_once_with(mocked_default_path(), "w")
    mocked_open_handle = mocked_open()
    mocked_json_dump.assert_called_once_with(
        {
            "ui_version": "0.1.0",
            "cargo_package_version": "0.1.1",
            "tauri_config_version": "0.1.2",
            "git_commit_hash": "1234567890abcdef",
        },
        mocked_open_handle,
        indent=4,
    )


def test_build_info_default_path(mocker):
    expected_path = "/path/to/root/build-info.json"
    mocked_root_dir = mocker.patch("lavascope_cli_lib.build_info.ROOT_DIR")
    mocked_root_dir.joinpath.return_value = expected_path

    build_info = BuildInfo()
    res = build_info.default_path()

    assert res == expected_path, f"{res} != {expected_path}"
