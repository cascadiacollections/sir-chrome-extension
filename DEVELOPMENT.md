# S.I.R Chrome Extension - Development Guide

## Quick Start

### Prerequisites

- Node.js >= 24.0.0
- npm >= 10.0.0
- Chrome browser
- VS Code with recommended extensions (or use Dev Container)

### Setup

```bash
npm install
npm run build
npm test
```

## Development Workflow

### 1. Building the Extension

```bash
# Development build with source maps
npm run build:dev

# Production build
npm run build

# Watch mode for active development
npm run build:watch
```

### 2. Testing in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select the `/app` folder
4. The extension will appear in your extensions list

### 3. Debugging

#### Using VS Code Debugger

1. Run the "Launch Chrome with Extension" debug configuration
2. This will open Chrome with your extension loaded
3. Set breakpoints in your TypeScript code
4. Debug directly in VS Code

#### Manual Debugging

1. Right-click the S.I.R extension icon → "Inspect popup"
2. Or navigate to `chrome://extensions/` → S.I.R → "Inspect views: background page"
3. Use Chrome DevTools to debug

### 4. Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Type checking
npm run type-check
```

### 5. Live Development

```bash
# Start watch mode
npm run build:watch

# In another terminal, run tests in watch mode
npm run test:watch
```

## Extension Architecture

### Files Structure

```
app/
├── manifest.json          # Extension manifest (V3)
├── scripts/
│   └── background.ts      # Service worker (main logic)
├── images/               # Extension icons
└── _locales/            # Internationalization
```

### Key Components

#### MediaPlayer Class

- Manages audio playback state
- Handles Chrome extension badge updates
- Implements retry logic for network failures
- Provides visual feedback through colored badges

#### Configuration

- Radio stream URL: `http://www.smodcast.com/radio/stream/20`
- Auto-retry on failure with exponential backoff
- Maximum 3 retry attempts
- 2-second retry delay

### Chrome Extension APIs Used

- `chrome.action` - Badge text, color, and title updates
- `chrome.runtime` - Extension lifecycle events
- Audio Web API - Stream playback

## Development Tips

### Adding New Features

1. Update the `background.ts` file
2. Add corresponding tests in `test/test.mjs`
3. Update the manifest.json if new permissions needed
4. Build and test in Chrome

### Debugging Issues

1. Check the background page console for errors
2. Verify manifest.json syntax
3. Ensure all required permissions are declared
4. Test network connectivity to the radio stream

### Performance Considerations

- Service workers have limited lifetime
- Use efficient state management
- Minimize memory usage
- Handle network interruptions gracefully

## VS Code Extensions

### Recommended Extensions

The workspace includes recommendations for:

- **Chrome Extension Developer Tools** - Manifest validation and debugging
- **JavaScript Debugger (Nightly)** - Advanced debugging capabilities
- **Chrome Extension Manifest JSON Schema** - Manifest IntelliSense
- **Web Extension Helper** - Cross-browser extension development
- **ESLint** - Code quality and style enforcement
- **Prettier** - Code formatting
- **TypeScript** - Language support and type checking
- **Mocha Test Explorer** - Test visualization and running

### Debug Configurations

1. **Launch Chrome with Extension** - Opens Chrome with extension loaded
2. **Attach to Chrome Extension** - Attaches to running Chrome instance
3. **Debug Extension Background Script** - Specific background script debugging
4. **Debug Tests** - Run and debug Mocha tests

## Common Tasks

### Update Extension Version

1. Update version in `package.json`
2. Update version in `app/manifest.json`
3. Update `CHANGELOG.md`
4. Build and test

### Add New Dependencies

```bash
npm install <package-name>
npm run build
npm test
```

### Deploy for Testing

1. Run `npm run build`
2. Zip the `/app` folder
3. Share for manual installation or submit to Chrome Web Store

## Troubleshooting

### Build Issues

- Ensure Node.js 18+ is installed
- Clear `node_modules` and reinstall: `npm run clean && npm install`
- Check for TypeScript compilation errors

### Extension Not Loading

- Verify manifest.json syntax
- Check file permissions
- Ensure all files are in `/app` directory
- Clear Chrome extension cache

### Audio Not Playing

- Check network connectivity
- Verify stream URL is accessible
- Check Chrome's autoplay policies
- Review background page console for errors

### Tests Failing

- Ensure all dependencies are installed
- Check sinon-chrome mock setup
- Verify test file paths in mocha configuration

## Resources

- [Chrome Extension Developer Guide](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Documentation](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Service Workers in Extensions](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
- [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/reference/)
