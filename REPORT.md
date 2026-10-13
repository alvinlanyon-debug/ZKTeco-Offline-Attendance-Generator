# Zen AtGen 2.0.0 — Design and Release Report

## Scope

This release aligns the marketing homepage, app tables, report preview, mobile layouts, and download instructions with `design-sys/zen-attendance-generator-design-system-md.txt`. It preserves the existing report generation and export flow.

## Design changes

- Kept the one-line “Turn device exports” hero and constrained its display size responsively so it remains centered within the content frame.
- Applied the cream canvas, charcoal text, Junicode hero, Bricolage Grotesque working type, restrained coral, soft cards, and neutral step markers. Used Zen’s published dark-theme paper and ink values for the feature chapter, with low-contrast card fills and dividers.
- Kept the app’s nested-square brand mark and compact mobile header; reduced narrow-screen hero and navigation sizing to prevent clipping.
- Added clear table column and row rules, restrained zebra striping, and softer green/rust status fills in the app and self-contained report stylesheet.
- Replaced the fixed SVG workflow timeline with a compact two-column ordered list that collapses to one column on mobile.
- Retained the download guide’s four-step path from repository ZIP to opening the included app and loading device files.
- Added the post-hero feature showcase using Zen’s published feature-section structure: a feature selector beside a large, rounded media panel, with horizontal feature tabs on narrow screens. The reference implementation is [Zen Browser’s Features.astro component](https://github.com/zen-browser/www/blob/main/src/components/Features.astro); AtGen uses its own accessible HTML and interaction code with project copy and media.
- Added sanitized, app-cropped screenshots for roster classification, attendance exceptions, and report setup. Employee names and identifiers are covered in the roster preview.
- Replaced the static report mockup in the hero with the supplied video in a rounded, cropped frame, following Zen’s [video component](https://github.com/zen-browser/www/blob/main/src/components/Video.astro) treatment. Added three brief, time-based focus zooms and reduced-motion handling. Kept the post-hero feature section and removed only its demo-video tab.

The dark palette follows the official [Zen Browser website theme tokens](https://github.com/zen-browser/www/blob/main/src/styles/global.css). In Zen's source, dark mode is a site-wide color scheme rather than a standalone dark feature block; AtGen uses those values for one capabilities chapter to preserve the light-page layout while bringing in the dark treatment requested here.

## Functional and distribution changes

- Set the application version to 2.0.0 and updated the changelog and release instructions.
- Regenerated the online-local app entry and portable offline copy from `app/app/` using `scripts/package-offline.ps1`.
- Kept sample `.dat` and `.csv` data excluded from version control.

## Validation

- Passed `node --check` for the canonical app, hosted app, generated local app, and offline app JavaScript.
- Passed `git diff --check` and checked all local HTML links and assets for existing targets.
- Regenerated the package and confirmed all four offline files exactly match `app/app/`; all three app version files report 2.0.0.
- Confirmed attendance `.dat` and `.csv` data remain ignored by Git.
- Verified the generated screenshot crops and identifier removal visually; validated feature asset paths and interactive tab JavaScript syntax. The in-app browser rejected a local video URL, so the walkthrough was not played in-browser during this pass.
- The hero video placement and zoom timing still need rendered review; the in-app browser does not permit opening the local branch preview under its current file-URL policy.
- Visual browser verification after the changes remains unperformed in this turn; the supplied screenshots were used as the before-state reference.
- No production employee attendance files are included in this report or release.

## Deployment note

GitHub Pages deploys on pushes to `main`. This release is prepared on `zen-atgen-product-refresh`; pushing that branch preserves the existing branch and commit but does not itself publish the Pages site.
