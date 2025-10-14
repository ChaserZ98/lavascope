from ..path_const import ANDROID_DIR
from .generate_keystore import (
    KEY_ALIAS,
    STORE_PASSWORD,
    STORE_PATH,
)

PROPERTIES_PATH = ANDROID_DIR.joinpath("keystore.properties")


def generate_properties():
    with open(PROPERTIES_PATH, "w") as f:
        f.write(f"keyAlias={KEY_ALIAS}\n")
        f.write(f"password={STORE_PASSWORD}\n")
        f.write(f"storeFile={STORE_PATH}\n")

    return PROPERTIES_PATH
