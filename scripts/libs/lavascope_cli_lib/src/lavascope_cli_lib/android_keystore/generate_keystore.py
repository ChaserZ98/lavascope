import os
import subprocess
from abc import ABC

from ..path_const import ANDROID_DIR


class GenerateKeystoreError(Exception, ABC):
    pass


class GenerateKeystoreProcessError(GenerateKeystoreError):
    def __init__(self, exception):
        super().__init__()
        self.exception = exception

    def __str__(self):
        return f"Error executing keytool command: {self.exception}"


class GenerateKeystoreKeytoolError(GenerateKeystoreError):
    def __init__(self, exception):
        super().__init__()
        self.exception = exception

    def __str__(self):
        return f"Error executing keytool command: {self.exception}"


class GenerateKeystoreUnknownError(GenerateKeystoreError):
    def __init__(self, exception):
        super().__init__()
        self.exception = exception

    def __str__(self):
        return f"Unknown error when generating keystore: {self.exception}"


STORE_PATH = ANDROID_DIR.joinpath("dev-keystore.jks")
KEY_ALG = "RSA"
KEY_SIZE = "2048"
VALIDITY = "7"
KEY_ALIAS = "dev"
STORE_PASSWORD = "lavascope"
KEY_CN = "dev"
KEY_OU = "dev"
KEY_O = "dev"
KEY_L = "dev"
KEY_ST = "dev"
KEY_C = "dev"

keytool_command = [
    "keytool",
    "-genkey",
    "-v",
    "-keystore",
    STORE_PATH,
    "-keyalg",
    KEY_ALG,
    "-keysize",
    KEY_SIZE,
    "-validity",
    VALIDITY,
    "-alias",
    KEY_ALIAS,
    "-dname",
    f"CN={KEY_CN}, OU={KEY_OU}, O={KEY_O}, L={KEY_L}, ST={KEY_ST}, C={KEY_C}",
    "-storepass",
    STORE_PASSWORD,
]


def generate_keystore():
    try:
        if STORE_PATH.exists():
            os.remove(STORE_PATH)
        res = subprocess.run(
            keytool_command, capture_output=True, text=True, check=True
        )
        return res
    except subprocess.CalledProcessError as e:
        raise GenerateKeystoreProcessError(e)
    except FileNotFoundError as e:
        raise GenerateKeystoreKeytoolError(e)
    except Exception as e:
        raise GenerateKeystoreUnknownError(e)
