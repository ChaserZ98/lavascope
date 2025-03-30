import fileinput
import os
from enum import Enum


class Platform(Enum):
    WINDOWS = "Windows"
    LINUX = "Linux"
    MACOS = "MacOS"
    ANDROID = "Android"


if __name__ == "__main__":
    release_link = "https://github.com/ChaserZ98/lavascope/releases/latest/download"
    app_name = "LavaScope"
    version = os.environ.get("NEXT_VERSION")
    if version is None:
        raise ValueError("NEXT_VERSION is not set")

    new_links: list[tuple[Platform, str]] = []

    with fileinput.input("README.md", inplace=True) as f:
        for line in f:
            match line:
                case line if line.startswith("[Windows-latest-url]"):
                    link = f"{release_link}/{app_name}_{version}_amd64-setup.exe"
                    print(f"[Windows-latest-url]: {link}")
                    new_links.append((Platform.WINDOWS, link))

                case line if line.startswith("[Linux-latest-url]"):
                    link = f"{release_link}/{app_name}_{version}_amd64.deb"
                    print(f"[Linux-latest-url]: {link}")
                    new_links.append((Platform.LINUX, link))
                case line if line.startswith("[MacOS-latest-url]"):
                    link = f"{release_link}/{app_name}_{version}_universal.dmg"
                    print(f"[MacOS-latest-url]: {link}")
                    new_links.append((Platform.MACOS, link))
                case line if line.startswith("[Android-latest-url]"):
                    link = f"{release_link}/{app_name}_{version}_universal.apk"
                    print(f"[Android-latest-url]: {link}")
                    new_links.append((Platform.ANDROID, link))
                case _:
                    print(line, end="")

    for platform, link in new_links:
        print(f"Updated {platform.name} link to {link}")
