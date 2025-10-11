import os
import subprocess

from common.path_const import ANDROID_DIR

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
        print(res.stderr)
        print(res.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Error executing keytool command: {e}")
        print(e.output)
    except FileNotFoundError as e:
        print(f"Error executing keytool command: {e}")
        print("Make sure keytool is installed and in your PATH.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


PROPERTIES_PATH = ANDROID_DIR.joinpath("keystore.properties")


def generate_properties():
    with open(PROPERTIES_PATH, "w") as f:
        f.write(f"keyAlias={KEY_ALIAS}\n")
        f.write(f"password={STORE_PASSWORD}\n")
        f.write(f"storeFile={STORE_PATH}\n")

    print(f"Keystore properties generated at {PROPERTIES_PATH}")


if __name__ == "__main__":
    generate_keystore()
    generate_properties()
