# Changelog

All notable changes to the S.I.R Chrome Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Fixed webpack configuration to properly detect and apply production mode minification
- Fixed npm package script to create zip with correct structure (manifest.json at root)

### Changed

- Production builds now properly minified (~4KB vs ~27KB unminified)
- Package script now matches CI workflow structure for consistency
- Webpack config now uses `argv.mode` instead of `process.env.NODE_ENV` for mode detection

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
