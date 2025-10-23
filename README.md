# S.I.R, Smodcast Internet Radio - Chrome Extension

Unofficial Chrome Extension for Kevin Smith's Smodcast Internet Radio, S.I.R.

> **Quick Links**: [🚀 Quickstart](QUICKSTART.md) | [📖 Onboarding Guide](ONBOARDING.md) | [💻 Development Docs](DEVELOPMENT.md) | [🤝 Contributing](CONTRIBUTING.md)

[![CI/CD](https://github.com/cascadiacollections/sir-chrome-extension/actions/workflows/ci.yml/badge.svg)](https://github.com/cascadiacollections/sir-chrome-extension/actions/workflows/ci.yml)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/d/gmmjhhjkjopgmnpidenddlplckefdbjd.svg)](https://chrome.google.com/webstore/developer/edit/gmmjhhjkjopgmnpidenddlplckefdbjd)
[![Node Version](https://img.shields.io/badge/node-%3E%3D24.0.0-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

- 🎵 **One-click playback** - Click the extension icon to start/stop the radio stream
- 🔄 **Auto-retry** - Automatically attempts to reconnect if the stream is interrupted
- 📊 **Visual feedback** - Badge shows current status (OFF/ON/Loading/Error)
- 🎨 **Color-coded badges** - Green for playing, gray for stopped, orange for loading, red for
  errors
- ⚡ **Lightweight** - Minimal resource usage with efficient background processing
- 🔧 **Manifest V3** - Built with the latest Chrome extension standards

## Installation

### From Chrome Web Store

1. Visit the
   [Chrome Web Store page](https://chrome.google.com/webstore/developer/edit/gmmjhhjkjopgmnpidenddlplckefdbjd)
2. Click "Add to Chrome"

### From Source

See the [Onboarding Guide](ONBOARDING.md) for detailed setup instructions.

Quick start:

```bash
git clone https://github.com/cascadiacollections/sir-chrome-extension.git
cd sir-chrome-extension
npm install
npm run build
```

Then load the `app` folder as an unpacked extension in Chrome.

## Development

New contributors should start with the [Onboarding Guide](ONBOARDING.md).

### Prerequisites

- Node.js >= 24.0.0
- npm >= 10.0.0

### Quick Start

```bash
# Install dependencies
npm install

# Build for development
npm run build:dev

# Build for production
npm run build

# Watch for changes during development
npm run build:watch

# Run tests
npm run test

# Lint code
npm run lint
```

### Dev Container (Recommended)

This project includes a dev container configuration for consistent development environments:

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) for VS Code
3. Open the project in VS Code
4. Click "Reopen in Container" when prompted

The dev container includes all dependencies and tools pre-configured!

For detailed development information, see [DEVELOPMENT.md](DEVELOPMENT.md).

### Project Structure

```
app/
├── manifest.json          # Extension manifest
├── dist/                  # Built files (generated)
├── images/               # Extension icons
├── scripts/
│   └── background.ts     # Main background script
└── _locales/
    └── en/
        └── messages.json # Internationalization

test/                     # Test files
webpack.config.js        # Build configuration
tsconfig.json           # TypeScript configuration
```

### Scripts

- `npm run build` - Build for production
- `npm run build:dev` - Build for development with source maps
- `npm run build:watch` - Watch mode for development
- `npm run test` - Run test suite
- `npm run lint` - Lint TypeScript files
- `npm run type-check` - Type check without emitting files
- `npm run package` - Build and create extension package
- `npm run clean` - Clean build artifacts

## Technical Details

### Architecture

- **Background Script**: Manages audio playback and Chrome extension APIs
- **Service Worker**: Runs in the background to handle user interactions
- **Audio Streaming**: Direct connection to S.I.R's streaming server

### Error Handling

- Automatic retry logic with exponential backoff
- Visual error indicators in the extension badge
- Comprehensive logging for debugging

### Browser Compatibility

- Chrome (Manifest V3)
- Chromium-based browsers (Edge, Brave, etc.)

## Contributing

We welcome contributions! Please see our [Onboarding Guide](ONBOARDING.md) for getting started and [Contributing Guidelines](CONTRIBUTING.md) for the full process.

Quick steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- TypeScript with strict type checking
- ESLint for code quality
- Prettier-compatible formatting
- Private class fields for encapsulation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This is an unofficial Chrome extension for S.I.R (Smodcast Internet Radio). It is not affiliated
with or endorsed by Kevin Smith, SModcast, or any related entities.

## Support

If you encounter any issues or have suggestions, please
[open an issue](https://github.com/cascadiacollections/sir-chrome-extension/issues) on GitHub.
