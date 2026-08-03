![version](https://img.shields.io/badge/version-v0.01-blue)

Status: stable — the active, published app is in `docs/`. The folder `Toptech_Attendance_Analyzer_updated/` has been archived and moved to `archived/Toptech_Attendance_Analyzer_updated/`.

# ZKTeco-Offline-Attendance-Generator
# ZKTeco Offline Attendance Generator

An offline-first browser app for analyzing ZKTeco attendance exports and producing weekly or monthly reports. Attendance data is processed locally in the browser; uploaded files are not sent to a server.

## Use it

- Online: open `https://alvinlanyon-debug.github.io/ZKTeco-Offline-Attendance-Generator/`.
- Offline: share the `docs/offline/` folder, then open `index.html` in a modern browser. Downloading or cloning this repository also works.

Upload `attlog.dat` and, optionally, `user.dat`. Set the required check-in interval, identify guards, then analyze, print, or export CSV reports.

## Project structure

## Project Structure

```
ZKTeco-Offline-Attendance-Generator/
├── README.md                                    # This file (updated with version badge)
├── LICENSE                                      # GNU General Public License v3.0
├── docs/                                        # Published site (use this to run the app in the browser)
│   ├── index.html
│   ├── script.js
│   └── style.css
└── archived/Toptech_Attendance_Analyzer_updated/ # Old version (deprecated, kept for reference)
    ├── index.html
    ├── Toptech_Attendance_Analyzer.html
    ├── script.js
    └── style.css
```

## Getting Started

### Run in the browser (no download)

The easiest way to run the app without downloading is to use GitHub Pages. I have copied the app into `docs/` on a branch; after you enable Pages for the repository (see instructions below) it will be available at `https://alvinlanyon-debug.github.io/ZKTeco-Offline-Attendance-Generator/`.

### Usage

1. Clone or download this repository
2. Open `docs/index.html` in a modern web browser (or use the published Pages site once enabled)
3. Import your ZKTeco device export file
4. Configure report parameters as needed
5. Generate and export your attendance report
```text
app/                         # Canonical web application
  index.html                 # Entry point
  script.js                  # Attendance parsing and report logic
  style.css                  # Interface and print styling
  version.js                 # Current app version
docs/offline/                # Shareable offline application snapshot
docs/README.md               # Offline sharing and refresh instructions
scripts/package-offline.ps1  # Rebuilds docs/offline from app/
.github/workflows/
  deploy-pages.yml           # GitHub Pages deployment
CHANGELOG.md                 # User-visible release notes
```

## Releases and versioning

This project uses [Semantic Versioning](https://semver.org/):

- `MAJOR.MINOR.PATCH`, for example `1.0.0`.
- Increment `PATCH` for compatible fixes, `MINOR` for compatible features, and `MAJOR` for breaking changes.
- Update `app/version.js` and `CHANGELOG.md` together, then create a matching Git tag such as `v1.0.1` and a GitHub Release.

## Deployment

(remaining sections unchanged)
The included GitHub Actions workflow deploys `app/` whenever a change reaches `main`. GitHub Pages has been configured to publish the URL listed above.

## Development

This is intentionally a dependency-free static application. A local web server is optional; opening `app/index.html` directly works for the current browser APIs.

## License

GPL-3.0. See [LICENSE](LICENSE).
