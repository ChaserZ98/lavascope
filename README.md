<div id="readme-top"></a>

<!-- PROJECT LOGO -->
<div align="center">
    <a href="https://github.com/ChaserZ98/lavascope">
        <img src="https://raw.githubusercontent.com/ChaserZ98/lavascope/refs/heads/dev/public/favicon.ico" alt="Logo" height="120">
    </a>
    <h3 align="center">LavaScope</h3>
    <p align="center">
        A cross-platform GUI tool to monitor and manage firewall rules
        <br />
        <a href="#demo">View Demo</a>
        ·
        <a href="https://github.com/ChaserZ98/lavascope/issues">Report Bug</a>
        ·
        <a href="https://github.com/ChaserZ98/lavascope/issues">Request Feature</a>
    </p>
</div>

<!-- PROJECT SHIELDS -->

[![Contributors][contributors-badge]][contributors-url]
[![Commit][commit-badge]][commit-url]
[![Forks][forks-badge]][forks-url]
[![Stargazers][stars-badge]][stars-url]
[![Issues][issues-badge]][issues-url]
[![MIT License][license-badge]][license-url]

[contributors-badge]: https://img.shields.io/github/contributors/ChaserZ98/lavascope.svg?style=flat&label=Contributors
[contributors-url]: https://github.com/ChaserZ98/lavascope/graphs/contributors
[commit-badge]: https://img.shields.io/github/commit-activity/m/ChaserZ98/lavascope?color=blue&label=Commit%20History
[commit-url]: https://github.com/ChaserZ98/lavascope/commits/main/
[forks-badge]: https://img.shields.io/github/forks/ChaserZ98/lavascope.svg?style=flat&label=Forks
[forks-url]: https://github.com/ChaserZ98/lavascope/network/members
[stars-badge]: https://img.shields.io/github/stars/ChaserZ98/lavascope.svg?style=flat&label=Stars
[stars-url]: https://github.com/ChaserZ98/lavascope/stargazers
[issues-badge]: https://img.shields.io/github/issues/ChaserZ98/lavascope.svg?style=flat&label=Issues
[issues-url]: https://github.com/ChaserZ98/lavascope/issues
[license-badge]: https://img.shields.io/github/license/ChaserZ98/lavascope.svg?style=flat&label=License
[license-url]: https://github.com/ChaserZ98/lavascope/blob/dev/LICENSE

<details>
    <summary>Table of Contents</summary>
    <ol>
        <li>
            <a href="#about-the-project">About The Project</a>
            <ul>
                <li><a href="#demo">Demo</a></li>
                <li><a href="#built-with">Built With</a></li>
                <li><a href='#features'>Features</a></li>
            </ul>
        </li>
        <li><a href="#download">Download</a></li>
        <li><a href="#develop">Develop</a></li>
        <li><a href="#license">License</a></li>
        <li><a href="#contact">Contact</a></li>
        <li><a href="#acknowledgments">Acknowledgments</a></li>
    </ol>
</details>

## About The Project

### Demo

### Built With

[![Tauri][Tauri-icon]][Tauri-url]
[![React][React-icon]][React-url]
[![Vite][Vite-icon]][Vite-url]

[Tauri-icon]: https://img.shields.io/badge/Tauri-black.svg?style=flat&logo=tauri
[Tauri-url]: https://v2.tauri.app/
[React-icon]: https://img.shields.io/badge/React-black.svg?style=flat&logo=react
[React-url]: https://react.dev/
[Vite-icon]: https://img.shields.io/badge/Vite-black.svg?style=flat&logo=vite
[Vite-url]: https://vite.dev/

### Features

- [x] Cross-platform
    - [x] Windows
    - [x] MacOS
    - [x] Linux
    - [x] Android
    - [ ] iOS
- [x] Dark/Light theme
- [x] I18n support
    - [x] Simplified Chinese
    - [x] Traditional Chinese
    - [x] English
    - [ ] ...
- [x] Current public IP lookup
    - [x] IPv4 support
    - [x] IPv6 support
    - [x] Custom endpoints
- [ ] Trigger event
- [ ] Multi-provider support
    - [x] [![Vultr][Vultr-badge]][Vultr-url]
        - [x] Group Operation
            - [x] Create
            - [x] Read
            - [x] Update
                - [x] Description
                - [ ] Attach machine
            - [x] Delete
        - [x] Rule Operation
            - [x] Create
                - [x] Protocol type
                - [x] Port
                - [x] Source type
                    - [x] My IP
                    - [x] Custom rule
                    - [x] Anywhere
                    - [x] Cloudflare
                    - [ ] Vultr Load Balancer
                - [x] Subnet size
                - [x] Notes
            - [x] Read
            - [x] Delete
    - [ ] [![AWS][AWS-badge]][AWS-url]
    - [ ] ...

[Vultr-badge]: https://img.shields.io/badge/Vultr-black.svg?style=flat&logo=vultr&logoColor=blue
[Vultr-url]: https://www.vultr.com
[AWS-badge]: https://img.shields.io/badge/AWS-black.svg?style=flat&logo=amazonwebservices&logoColor=orange
[AWS-url]: https://aws.amazon.com

<p align="right"><a href="#readme-top">⬆️ Back to top</a></p>

## Download

### Latest

- [Windows][Windows-latest-url]
- [MacOS][MacOS-latest-url]
- [Android][Android-latest-url]
- [Linux][Linux-latest-url]

[Windows-latest-url]: https://github.com/ChaserZ98/lavascope/releases/latest/download/LavaScope_0.1.0_amd64-setup.exe
[MacOS-latest-url]: https://github.com/ChaserZ98/lavascope/releases/latest/download/LavaScope_0.1.0_universal.dmg
[Android-latest-url]: https://github.com/ChaserZ98/lavascope/releases/latest/download/LavaScope_0.1.0_universal.apk
[Linux-latest-url]: https://github.com/ChaserZ98/lavascope/releases/latest/download/LavaScope_0.1.0_amd64.deb

### Previous releases

Check the [release](https://github.com/ChaserZ98/lavascope/releases) page if you are looking for any specific version or build.

<p align="right"><a href="#readme-top">⬆️ Back to top</a></p>

## Develop

### Prerequsite

Basically you will need

- Rust programming environment
- Javascript runtime

For details, please read [instructions](https://v2.tauri.app/start/prerequisites/) on Tauri website.

Note that this project uses [Bun](https://bun.sh/) as Javascript runtime instead of Node.js. Please refer to [instructions](https://bun.sh/docs/installation) on setting up Bun.

### Install frontend dependencies

```bash
bun i
```

### Start develop

```bash
bun tauri dev
```

### Build from source

```bash
bun tauri build
```

<p align="right"><a href="#readme-top">⬆️ Back to top</a></p>

## License

Distributed under the MIT License. See [`LICENSE`][License-url] for more information.

[License-url]: https://github.com/ChaserZ98/lavascope/blob/dev/LICENSE

<p align="right"><a href="#readme-top">⬆️ Back to top</a></p>

## Contact

Feiyu Zheng - feiyuzheng98@gmail.com

Project Link: [https://github.com/ChaserZ98/lavascope](https://github.com/ChaserZ98/lavascope)

<p align="right"><a href="#readme-top">⬆️ Back to top</a></p>

## Acknowledgments

[![Vultr][Vultr-badge]][Vultr-url]
[![Tauri][Tauri-icon]][Tauri-url]
[![React][React-icon]][React-url]
[![HeroUI][HeroUI-badge]][HeroUI-url]
[![Shields.io][shields.io-badge]][shields.io-url]

[HeroUI-badge]: https://img.shields.io/badge/HeroUI-black.svg?style=flat&logo=nextui&logoColor=white
[HeroUI-url]: https://heroui.com
[shields.io-badge]: https://img.shields.io/badge/shields.io-black.svg?style=flat&logo=shieldsdotio
[shields.io-url]: https://shields.io

<p align="right"><a href="#readme-top">⬆️ Back to top</a></p>
