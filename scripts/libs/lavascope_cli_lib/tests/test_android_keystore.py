import subprocess
from dataclasses import dataclass
from typing import Any
from unittest import mock

import pytest
from lavascope_cli_lib.android_keystore.generate_keystore import (
    GenerateKeystoreKeytoolError,
    GenerateKeystoreProcessError,
    GenerateKeystoreUnknownError,
    generate_keystore,
)
from lavascope_cli_lib.android_keystore.generate_properties import (
    generate_properties,
)


@dataclass
class MockGenerateKeyStoreModule:
    store_path: Any
    store_password: Any
    keytool_command: Any


@pytest.fixture
def mock_generate_keystore_module(mocker):
    store_path = mocker.patch(
        "lavascope_cli_lib.android_keystore.generate_keystore.STORE_PATH"
    )
    store_password = mocker.patch(
        "lavascope_cli_lib.android_keystore.generate_keystore.STORE_PASSWORD"
    )
    keytool_command = mocker.patch(
        "lavascope_cli_lib.android_keystore.generate_keystore.keytool_command"
    )

    return MockGenerateKeyStoreModule(
        store_path,
        store_password,
        keytool_command,
    )


@dataclass
class MockGeneratePropertiesModule:
    properties_path: Any
    store_password: Any
    key_alias: Any
    store_path: Any


@pytest.fixture
def mock_generate_properties_module(mocker):
    properties_path = mocker.patch(
        "lavascope_cli_lib.android_keystore.generate_properties.PROPERTIES_PATH"
    )
    store_password = mocker.patch(
        "lavascope_cli_lib.android_keystore.generate_properties.STORE_PASSWORD"
    )
    key_alias = mocker.patch(
        "lavascope_cli_lib.android_keystore.generate_properties.KEY_ALIAS"
    )
    store_path = mocker.patch(
        "lavascope_cli_lib.android_keystore.generate_properties.STORE_PATH"
    )

    return MockGeneratePropertiesModule(
        properties_path,
        store_password,
        key_alias,
        store_path,
    )


@pytest.fixture
def mock_os_remove(mocker):
    return mocker.patch("os.remove")


@pytest.fixture
def mock_subprocess_run(mocker):
    return mocker.patch("subprocess.run")


@pytest.fixture
def mock_open(mocker):
    return mocker.patch("builtins.open", new_callable=mock.mock_open)


def test_generate_keystore_removes_existing(
    mock_generate_keystore_module,
    mock_os_remove,
    mock_subprocess_run,
):
    mock_generate_keystore_module.store_path.exists.return_value = True

    generate_keystore()

    mock_os_remove.assert_called_once_with(mock_generate_keystore_module.store_path)
    mock_subprocess_run.assert_called_once_with(
        mock_generate_keystore_module.keytool_command,
        capture_output=True,
        text=True,
        check=True,
    )


def test_generate_keystore_process_error(
    mock_generate_keystore_module, mock_subprocess_run
):
    mock_generate_keystore_module.store_path.exists.return_value = False
    mock_subprocess_run.side_effect = subprocess.CalledProcessError(1, "")

    with pytest.raises(GenerateKeystoreProcessError) as e:
        generate_keystore()

    assert str(e.value).startswith("Error executing keytool command")

    mock_subprocess_run.assert_called_once_with(
        mock_generate_keystore_module.keytool_command,
        capture_output=True,
        text=True,
        check=True,
    )


def test_generate_keystore_keytool_error(
    mock_generate_keystore_module, mock_subprocess_run
):
    mock_generate_keystore_module.store_path.exists.return_value = False
    mock_subprocess_run.side_effect = FileNotFoundError()

    with pytest.raises(GenerateKeystoreKeytoolError) as e:
        generate_keystore()

    assert str(e.value).startswith("Error executing keytool command")

    mock_subprocess_run.assert_called_once_with(
        mock_generate_keystore_module.keytool_command,
        capture_output=True,
        text=True,
        check=True,
    )


def test_generate_keystore_unknown_error(
    mock_generate_keystore_module, mock_subprocess_run
):
    mock_generate_keystore_module.store_path.exists.return_value = False
    mock_subprocess_run.side_effect = Exception()

    with pytest.raises(GenerateKeystoreUnknownError) as e:
        generate_keystore()

    assert str(e.value).startswith("Unknown error when generating keystore:")

    mock_subprocess_run.assert_called_once_with(
        mock_generate_keystore_module.keytool_command,
        capture_output=True,
        text=True,
        check=True,
    )


def test_generate_properties(
    mock_generate_properties_module,
    mock_open,
):
    res = generate_properties()

    assert res == mock_generate_properties_module.properties_path

    mock_open.assert_called_once_with(
        mock_generate_properties_module.properties_path, "w"
    )
    mocked_open_handle = mock_open()
    mocked_open_handle.write.assert_has_calls(
        [
            mock.call(f"keyAlias={mock_generate_properties_module.key_alias}\n"),
            mock.call(f"password={mock_generate_properties_module.store_password}\n"),
            mock.call(f"storeFile={mock_generate_properties_module.store_path}\n"),
        ]
    )
