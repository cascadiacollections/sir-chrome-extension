# Onboarding Guide for S.I.R Chrome Extension

Welcome to the S.I.R Chrome Extension project! This guide will help you get up and running quickly.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Environment Options](#development-environment-options)
- [First Time Setup](#first-time-setup)
- [Verify Your Setup](#verify-your-setup)
- [Next Steps](#next-steps)
- [Getting Help](#getting-help)

## Prerequisites

Before you begin, ensure you have:

- **Node.js**: Version 24.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: Version 10.0.0 or higher (comes with Node.js)
- **Git**: For version control ([Download](https://git-scm.com/))
- **Chrome**: For testing the extension ([Download](https://www.google.com/chrome/))
- **Code Editor**: VS Code recommended ([Download](https://code.visualstudio.com/))

### Checking Your Prerequisites

```bash
# Check Node.js version (should be >= 24.0.0)
node --version

# Check npm version (should be >= 10.0.0)
npm --version

# Check Git
git --version
```

## Quick Start

The fastest way to get started (choose one option):

### Option 1: Standard Setup (5 minutes)

```bash
# Clone the repository
git clone https://github.com/cascadiacollections/sir-chrome-extension.git
cd sir-chrome-extension

# Install dependencies
npm install

# Build the extension
npm run build

# Run tests
npm test

# Start development mode
npm run build:watch
```

### Option 2: Dev Container Setup (10 minutes, recommended)

If you have [Docker Desktop](https://www.docker.com/products/docker-desktop) and the VS Code [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers):

1. Open the repository in VS Code
2. Click "Reopen in Container" when prompted (or use Command Palette: `Dev Containers: Reopen in Container`)
3. Wait for the container to build and dependencies to install
4. Everything is pre-configured and ready to go!

**Benefits of Dev Container:**
- Consistent environment across all developers
- Pre-installed tools and extensions
- No local Node.js installation conflicts
- Automatic setup on container creation

## Development Environment Options

### Using VS Code (Recommended)

1. Open the project folder in VS Code
2. Install recommended extensions when prompted (see `.vscode/extensions.json`)
3. The workspace will automatically configure:
   - TypeScript language server
   - ESLint for code quality
   - Prettier for formatting
   - Chrome debugging tools

### Using Other Editors

The project includes an `.editorconfig` file for consistent formatting across all editors. Install the EditorConfig plugin for your editor:

- **WebStorm/IntelliJ**: Built-in support
- **Sublime Text**: Install EditorConfig package
- **Vim**: Install editorconfig-vim plugin

## First Time Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/sir-chrome-extension.git
cd sir-chrome-extension
```

### 2. Install Dependencies

```bash
npm install
```

This will install all development dependencies including TypeScript, Webpack, ESLint, and testing tools.

### 3. Build the Extension

```bash
# Development build with source maps
npm run build:dev

# Or production build
npm run build
```

This compiles TypeScript to JavaScript and outputs to `app/dist/`.

### 4. Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `app` folder from this project
5. The S.I.R extension icon should appear in your toolbar

### 5. Verify Installation

Click the extension icon to test:
- It should show as "OFF" initially
- Clicking should start the radio stream
- Badge should turn green and show "ON"
- Audio should play (if stream is available)

## Verify Your Setup

Run all quality checks to ensure everything is working:

```bash
# Quick validation (runs all checks)
npm run validate-setup

# Or run individual checks:

# Type checking
npm run type-check

# Linting
npm run lint

# Tests
npm test

# Full build
npm run build
```

All commands should complete successfully with no errors.

## Next Steps

### Learn the Codebase

1. **Read the documentation:**
   - [`README.md`](README.md) - Project overview and features
   - [`DEVELOPMENT.md`](DEVELOPMENT.md) - Detailed development guide
   - [`CONTRIBUTING.md`](CONTRIBUTING.md) - Contribution guidelines
   - [`QUICK-REFERENCE.md`](QUICK-REFERENCE.md) - Quick command reference

2. **Explore the code structure:**
   ```
   app/
   ├── manifest.json       # Extension configuration
   ├── scripts/
   │   └── background.ts   # Main logic (start here!)
   ├── images/            # Extension icons
   └── _locales/          # Translations
   
   test/                  # Unit tests
   ```

3. **Review key files:**
   - `.github/copilot-instructions.md` - Coding standards and patterns
   - `tsconfig.json` - TypeScript configuration
   - `eslint.config.mjs` - Linting rules
   - `.editorconfig` - Editor settings

### Development Workflow

```bash
# Start watch mode for active development
npm run build:watch

# In another terminal, run tests in watch mode
npm run test:watch

# Make changes to app/scripts/background.ts
# The build will automatically recompile
# Reload the extension in Chrome to test changes
```

### Making Your First Contribution

1. **Find an issue to work on:**
   - Look for issues labeled `good first issue`
   - Check the [issue tracker](https://github.com/cascadiacollections/sir-chrome-extension/issues)

2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes:**
   - Follow the coding standards in `.github/copilot-instructions.md`
   - Write tests for new functionality
   - Run `npm run pre-commit` before committing

4. **Submit a pull request:**
   - Push your branch to your fork
   - Open a PR against the `main` branch
   - Fill out the PR template completely

### Debugging Tips

#### VS Code Debugging

1. Set breakpoints in your TypeScript code
2. Press F5 or use the "Launch Chrome with Extension" debug configuration
3. Chrome will open with your extension loaded
4. Debug directly in VS Code!

#### Manual Debugging

1. Right-click the extension icon → "Inspect popup"
2. Or go to `chrome://extensions/` → Find S.I.R → Click "Inspect views: background page"
3. Use Chrome DevTools to debug

#### Common Issues

**Build fails:**
```bash
# Clean and reinstall
npm run clean
npm install
npm run build
```

**Extension not working:**
- Check Chrome console for errors
- Verify manifest.json is valid
- Ensure background.js was generated in app/dist/
- Try reloading the extension in chrome://extensions/

**Tests failing:**
```bash
# Update dependencies
npm install
# Clear any cache
npm run clean
npm run build
npm test
```

## Getting Help

### Resources

- **Documentation:** Check the docs in this repository
- **GitHub Issues:** [Open an issue](https://github.com/cascadiacollections/sir-chrome-extension/issues) for bugs or questions
- **GitHub Discussions:** Ask questions and share ideas
- **Code Review:** All PRs receive detailed feedback

### Communication

- Be respectful and constructive
- Provide context when asking questions
- Include error messages and steps to reproduce issues
- Share relevant code snippets or screenshots

### Useful Commands Reference

```bash
# Development
npm run build:dev        # Development build
npm run build:watch      # Watch mode
npm run dev             # Quick dev build + type check

# Testing
npm test                # Run tests once
npm run test:watch      # Run tests in watch mode

# Code Quality
npm run lint            # Check code style
npm run lint:fix        # Auto-fix lint issues
npm run type-check      # TypeScript validation
npm run format          # Format all files
npm run format:check    # Check formatting

# Complete workflow
npm run pre-commit      # Format, lint, type-check, and test

# Production
npm run build           # Production build
npm run package         # Build and create .zip
```

## Welcome!

Thank you for joining the S.I.R Chrome Extension project! We're excited to have you here. Don't hesitate to ask questions and contribute. Every contribution, no matter how small, is valued and appreciated.

Happy coding! 🎵
