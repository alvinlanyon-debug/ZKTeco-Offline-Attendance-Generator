![version](https://img.shields.io/badge/version-v0.01-blue)

Status: stable — the active, published app is in `docs/`. The folder `Toptech_Attendance_Analyzer_updated/` has been archived and moved to `archived/Toptech_Attendance_Analyzer_updated/`.

# ZKTeco-Offline-Attendance-Generator

An offline solution for generating attendance reports from ZKTeco device exports.

## Overview

This project provides a web-based application for analyzing and processing attendance data exported from ZKTeco biometric devices. It allows users to generate comprehensive attendance reports without requiring internet connectivity.

## Features

- **Offline Processing**: Works completely offline - no internet connection required
- **ZKTeco Device Support**: Compatible with attendance data exported from ZKTeco biometric systems
- **Report Generation**: Create detailed attendance reports from device exports
- **Web-Based Interface**: User-friendly HTML/CSS/JavaScript interface
- **Data Analysis**: Process and analyze attendance patterns and records

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

### Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- ZKTeco device export file (CSV or compatible format)
- No server or internet connection required

(remaining sections unchanged)
