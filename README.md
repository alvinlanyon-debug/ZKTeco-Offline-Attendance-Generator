![version](https://img.shields.io/badge/version-v2.1.0-blue)

Status: stable — GitHub Pages publishes the online product from `app/`. The local product is packaged under `docs/`. The folder `Toptech_Attendance_Analyzer_updated/` is archived under `archived/Toptech_Attendance_Analyzer_updated/`.

# Zen AtGen — ZKTeco Attendance Generator

Zen AtGen is an open-source, browser-local attendance report generator for ZKTeco biometric terminals. It processes logs directly in your browser without uploading files to any external server.

## Use it

- Online: open `https://alvinlanyon-debug.github.io/ZKTeco-Offline-Attendance-Generator/`.
- Local: open `docs/index.html` in a modern browser, or share `docs/offline/` as a self-contained snapshot. Downloading or cloning this repository also works.

Upload `attlog.dat` and, optionally, `user.dat`. Set the required check-in interval, classify guards and staff, then analyze, print, or export CSV reports.

## Project Structure

```
ZKTeco-Offline-Attendance-Generator/
├── README.md                                    # Repository documentation
├── LICENSE                                      # GNU General Public License v3.0
├── CHANGELOG.md                                 # Historical release notes
├── app/                                         # GitHub Pages deployment root
│   ├── index.html                               # Online marketing homepage
│   ├── app/                                     # Online attendance application
│   └── download/                                # Online setup and download page
├── docs/                                        # Local application entry and generated snapshot
│   ├── index.html                               # Generated local application entry
│   ├── script.js, style.css, version.js         # Generated local assets
│   └── offline/                                 # Generated offline snapshot
├── scripts/
│   └── package-offline.ps1                      # Synchronizes docs/ from app/app/
└── archived/Toptech_Attendance_Analyzer_updated/ # Archived legacy code (deprecated)
```

## Getting Started

### Run in the browser (no download)

GitHub Pages publishes `app/index.html` as the site homepage at `https://alvinlanyon-debug.github.io/ZKTeco-Offline-Attendance-Generator/`. The attendance app is at `/app/`, and the download setup page is at `/download/`.

### Local usage

1. Clone or download this repository.
2. Open `docs/index.html` in a modern web browser.
3. Import your ZKTeco device export file (`attlog.dat` and optional `user.dat`).
4. Configure analysis parameters as needed.
5. Generate, preview, print, or export your attendance report.

## Releases and versioning

This project uses [Semantic Versioning](https://semver.org/):

- `MAJOR.MINOR.PATCH`, for example `2.1.0`.
- Increment `PATCH` for compatible fixes, `MINOR` for compatible features, and `MAJOR` for breaking changes.
- Update `app/app/version.js` and `CHANGELOG.md` together, then run `scripts/package-offline.ps1`, create a matching Git tag such as `v2.1.0`, and publish a GitHub Release.

## Deployment

The included GitHub Actions workflow deploys `app/` whenever a change reaches `main`. GitHub Pages is configured to publish the site root from the `app/` directory artifact.

## Development

Zen AtGen is a dependency-free static web application. A local web server is optional; opening `app/app/index.html` or the generated `docs/index.html` directly works for current browser APIs.

## License

GPL-3.0. See [LICENSE](LICENSE).
