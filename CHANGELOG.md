# Changelog

All notable changes to this project are documented here.

This project follows [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-10-13

### Added

- Reworked the product homepage and offline download guide around the project’s Zen Browser inspired design system.
- Added a clearer four-step repository download guide and compact mobile navigation.
- Added an interactive homepage feature showcase with cropped app screenshots.
- Replaced the earlier feature images with six new fictional-data examples covering staff classification, analysis settings, guard compliance, weekly timetables, report summaries, and attendance exceptions.

### Changed

- Centered and responsively scaled the single-line homepage hero; aligned section surfaces, cards, typography, and accents with Zen's current light and dark theme tokens.
- Rebuilt the workflow as an ordered, responsive step grid, replacing the fixed-height connector that drifted against variable-height content.
- Improved app and generated report table readability with column and row rules, subtle striping, and softened compliance colors.
- Updated the app version to 2.0.0 and refreshed the offline snapshot and release documentation.
- Replaced the synthetic report preview in the homepage hero with the supplied walkthrough video and three short zoom-ins during playback. Kept the feature section focused on app screenshots.
- Matched the hero headline’s normal Junicode weight to Zen’s current hero, expanded the desktop video frame, and applied Zen’s dark paper-and-ink palette to the feature chapter.
- Standardized the top and bottom section inset across the hero, feature chapter, workflow, capabilities, and footer at desktop, tablet, and mobile breakpoints.
- Refined the tablet/mobile header into a compact, accessible menu, and matched the mobile feature selector to Zen’s horizontal tab-and-description pattern while leaving large viewport hero styling intact.
- Added the five supplied screen recordings to the workflow demonstrations and capability cards for supervisor reports, guard compliance, and weekly timetables.

## [1.1.0] - 2026-10-02

### Added

- Implemented supervisor-specific report generation with three distinct report types:
  - Security Guard Attendance Report (guards only)
  - General Workers Attendance Report (general workers only)
  - All-Staff Attendance Report (includes all employees and unclassified)
- Implemented a three-tier employee classification system: Security Guard, General Worker, and Unclassified.
- Implemented explicit handling for unclassified employees with clear warnings in reports.
- Implemented detection and flagging of single-punch records with "verify direction" notes in all sections.
- Implemented a final report summary section that provides a concise overview including:
  - Selected report type
  - Reporting period
  - Number of employees in the selected group
  - Total recorded punch events
  - Records requiring attention (single punches and unclassified employees)

### Changed

- Refactored employee classification to use `workGroup` property (previously relied solely on `guard` flag).
- Updated the HTML UI to include a dedicated "Report type" selector in Step 4, allowing supervisors to choose their report independently.
- Updated the report generation pipeline to enforce supervisor filtering consistently across summaries, timetables, daily logs, and exports.
- Updated the detail table to display a "Note" column flagging single-punch records.
- Enhanced employee classification UI with radio buttons for explicit group selection (Security Guard, General Worker, Unclassified).
- Updated all report-generation functions to accept filtered employee sets based on selected report type.
- Preserved backward compatibility with existing localStorage data and guard flag for existing installations.

### Fixed

- Fixed issue where punch anomalies (single punches with ambiguous direction) were not flagged in detail views and reports.
- Fixed report generation to respect supervisor selection in all sections, preventing data leakage between groups.
- Fixed missing handling for employees with no classification, now explicitly flagged for attention.

## [1.0.1] - 2026-07-22

### Added

- Added a shareable offline distribution in `docs/offline/`.
- Added a packaging script for refreshing the offline distribution from `app/`.

### Changed

- Rewrote completed release-note entries in past tense.

## [1.0.0] - 2026-07-22

### Added

- Added a canonical static web app in `app/`.
- Added a GitHub Pages deployment workflow.
- Added in-app version metadata in `app/version.js`.

### Changed

- Updated documentation to reflect the online and offline usage paths.

### Removed

- Removed the duplicate legacy application folder and single-file copy.
