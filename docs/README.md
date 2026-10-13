# Offline Distribution

`offline/` contains a complete, shareable snapshot of the browser application at the current release version.

The local entry point is `docs/index.html`. It is generated from `app/app/` and works without connecting to the online marketing homepage. The `docs/offline/` folder is a portable copy of that same application.

## Download from GitHub

1. Open the project repository on GitHub.
2. Select the green **Code** button, then choose **Download ZIP**.
3. Extract the ZIP, open its `docs` folder, and open `index.html` in a modern browser.
4. Load `attlog.dat` and, if available, `user.dat` from your device export. Your files stay in the browser.

## Refreshing the snapshot

After changing `app/app/`, run the following from the repository root before releasing a new version:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/package-offline.ps1
```

The script refreshes `docs/index.html`, `docs/script.js`, `docs/style.css`, and `docs/version.js` from `app/app/`, then replaces `docs/offline/` with an exact snapshot of the same application. Update `app/app/version.js` and `CHANGELOG.md` in the same release.
