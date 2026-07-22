# Offline Distribution

`offline/` contains a complete, shareable snapshot of the browser application at the current release version.

To share it, send the whole `offline/` folder or a ZIP archive of that folder. The recipient extracts it and opens `index.html` in a modern browser. No installation, web server, or internet connection is required.

## Refreshing the snapshot

After changing `app/`, run the following from the repository root before releasing a new version:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/package-offline.ps1
```

The script replaces `docs/offline/` with an exact copy of the current `app/` files. Update `app/version.js` and `CHANGELOG.md` in the same release.
