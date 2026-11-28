# Changelog

All notable changes to the ShoutKit browser extension (formerly the S.I.R Chrome extension) are
documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- The extension is now ShoutKit, a Radio Browser client, instead of a one-station player for
  SModcast Internet Radio. Manifest and package version are **2.0.0**. No git tag or Web Store
  publish is part of this change.
- Playback uses a Manifest V3 offscreen document on Chromium so audio continues after the toolbar
  popup closes. `app/manifest.firefox.json` is a Firefox variant whose background page plays audio
  directly and does not request the Chromium-only `offscreen` permission.
- Favorites and the last station are stored in `chrome.storage.local`. Nothing plays on install.
- Stream reconnects are unchanged in spirit: three retries after the first failure, now waiting 2s,
  4s, and 8s. A reconnect does not send another Radio Browser play report.
- The toolbar badge still uses `OFF`, `...`, `ON`, and `ERR`. The colors are darkened so the white
  badge text stays readable.
- Icons are the ShoutKit mark, resized from `site/assets/app-icon-256.png` in
  `cascadiacollections/shoutkit`. Popup colors follow that app's blue accent and coral highlight
  (`ShoutKitTheme.swift`). The Android module still comments an older amber "SIR" palette; this UI
  follows the iOS theme.

### Removed

- The hard-coded S.I.R stream is not the default and is not an optional preset. Checked
  **2026-11-28**:
  - `GET https://broadcast.shoutcheap.com/proxy/willradio/stream` (the URL v1.4.3 played) returned
    **HTTP 502 Bad Gateway**, `Server: cc-web/1.6.3`, `Content-Type: text/html`, `Content-Length:
    117`, body `Sorry, an error occurred while attempting to load the requested page.` The same 502
    was returned for `/proxy/willradio`, `/proxy/willradio/`, the `http://` URL, and with
    `Icy-MetaData: 1`. DNS for `broadcast.shoutcheap.com` resolved (`209.133.221.250`); `GET /` on
    that host returned 200 and redirected to a login page. The station proxy is what failed.
  - `https://www.smodcast.com/sir` still links to
    `https://cp12.shoutcheap.com:2199/tunein/willradio.pls`. Requesting the `http://` playlist
    returned **302** to that HTTPS URL. The certificate is `CN=radio.shoutcheap.com` with SAN
    `DNS:radio.shoutcheap.com` only, so the hostname does not match. With verification disabled the
    body was `Unable to access account for willradio: Invalid username or password`.
  - `GET https://all.api.radio-browser.info/json/stations/search?name=smodcast&hidebroken=false&limit=5`
    returned `[]`.
- A preset of either URL would only surface an error, including if someone tapped it "in case it
  returns." If S.I.R comes back, add a curated station or let Radio Browser list it.

### Changed (earlier unreleased maintenance)

- **Modernized Chrome type definitions**: Migrated from deprecated `@types/chrome` (0.1.34) to
  official Google-maintained `chrome-types` (0.1.414)
- **Updated TypeScript target**: Upgraded from ES2020 to ES2023 for latest JavaScript features
- **Improved module resolution**: Changed from `node` to `bundler` for better modern bundling
  support
- **Updated ESLint configuration**: Updated ecmaVersion from 2022 to 2023 to match TypeScript target
- **Updated webpack ts-loader**: Configured explicit ES2023 target for consistent compilation
- **Updated dependencies**: Updated @typescript-eslint packages to 8.53.1 and prettier to 3.8.1

### Fixed

- Fixed webpack configuration to properly detect and apply production mode minification
- Fixed npm package script to create zip with correct structure (manifest.json at root)

### Technical Improvements

- Production builds now properly minified (~2.5KB vs ~4KB previously)
- Package script now matches CI workflow structure for consistency
- Webpack config now uses `argv.mode` instead of `process.env.NODE_ENV` for mode detection
- Added triple-slash reference directive for chrome-types integration

## [1.4.3] - 2025-06-02

### Added

- Enhanced error handling with automatic retry logic
- Visual feedback improvements with color-coded badges
- Loading state indicator
- TypeScript strict mode configuration
- Comprehensive test suite
- ESLint configuration for code quality
- GitHub Actions CI/CD pipeline
- Contributing guidelines
- Detailed README with usage instructions

### Changed

- Refactored MediaPlayer class with better architecture
- Improved state management with explicit state tracking
- Enhanced badge system with multiple states (OFF/ON/Loading/Error)
- Updated build system with better webpack configuration
- Modernized TypeScript configuration with strict settings
- Updated package.json with comprehensive scripts

### Fixed

- Version synchronization between package.json and manifest.json
- Badge text and color updates for all states
- Proper error handling for stream disconnections
- Memory leaks from event listeners

### Technical Improvements

- Added private class fields for better encapsulation
- Implemented proper TypeScript interfaces
- Added retry mechanism with configurable parameters
- Enhanced audio event handling
- Improved Chrome extension lifecycle management

## [1.4.1] - Previous Release

### Added

- Basic Chrome extension functionality
- Simple play/pause toggle
- Badge status indicator
- SModcast Internet Radio streaming

### Features

- One-click play/pause functionality
- Basic error handling
- Chrome extension badge status
