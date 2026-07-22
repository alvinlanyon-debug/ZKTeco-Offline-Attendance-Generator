# ZKTeco Offline Attendance Generator

An offline-first browser app for analyzing ZKTeco attendance exports and producing weekly or monthly reports. Attendance data is processed locally in the browser; uploaded files are not sent to a server.

## Use it

- Online: open `https://alvinlanyon-debug.github.io/ZKTeco-Offline-Attendance-Generator/`.
- Offline: share the `docs/offline/` folder, then open `index.html` in a modern browser. Downloading or cloning this repository also works.

Upload `attlog.dat` and, optionally, `user.dat`. Set the required check-in interval, identify guards, then analyze, print, or export CSV reports.

## Project structure

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

The included GitHub Actions workflow deploys `app/` whenever a change reaches `main`. GitHub Pages has been configured to publish the URL listed above.

## Development

This is intentionally a dependency-free static application. A local web server is optional; opening `app/index.html` directly works for the current browser APIs.

## License

GPL-3.0. See [LICENSE](LICENSE).
