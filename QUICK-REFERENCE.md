# ShoutKit extension — quick reference

## 🚀 Development Status: ✅ COMPLETE

### Recent Improvements (v1.4.3)

- ✅ Modern TypeScript architecture with strict typing
- ✅ Enhanced Chrome extension service worker implementation
- ✅ Automatic retry logic with visual feedback
- ✅ Comprehensive test suite with Chrome API mocking
- ✅ Modern build pipeline (Webpack + TypeScript)
- ✅ Code quality tools (ESLint + Prettier)
- ✅ VS Code workspace optimized for extension development
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Professional documentation and guides

## 🛠️ Quick Commands

```bash
# Start development
npm install && npm run build:dev

# Development workflow
npm run build:watch    # Auto-rebuild on changes
npm run test          # Run tests
npm run lint          # Check code quality
npm run format        # Format code

# Quality check (pre-commit)
npm run pre-commit    # Format + lint + type-check + test

# Production build
npm run build         # Optimized build
npm run package       # Create extension.zip
```

## 🧪 Testing in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → Select `/app` folder
4. Open the ShoutKit popup, pick a station, and press play. The icon click opens the popup; it does not start audio by itself.

## 🐛 Debugging

### VS Code Debugging

- **F5** → "Launch Chrome with Extension" for full debugging
- Set breakpoints in TypeScript files
- Debug directly in VS Code with source maps

### Chrome DevTools

- Right-click the ShoutKit icon → Inspect popup
- Or: `chrome://extensions/` → ShoutKit → service worker

## Extension

- Search Radio Browser and play a station from the toolbar popup
- Badge: `OFF`, `...` (connecting), `ON`, `ERR`
- Auto-retry: three reconnects at 2s, 4s, and 8s
- Favorites in `chrome.storage.local`

## 🎯 VS Code Extensions

Essential extensions automatically recommended:

- Chrome Extension Developer Tools
- JavaScript Debugger (Nightly)
- TypeScript support
- ESLint + Prettier
- Mocha Test Explorer
- GitLens
- GitHub Copilot

## 🔧 Architecture

```
controller.ts          playback, favorites, retries
radio-browser.ts       mirror discovery and failover
audio-engine.ts        HTMLAudioElement + ICY titles
offscreen-player.ts    Chromium background audio
popup.ts               toolbar UI
```

## 🚀 Next Steps

The extension is ready for:

1. **Testing**: Load in Chrome and verify functionality
2. **Playback**: confirm a station keeps playing after the popup closes
3. **Favorites**: save a station and find it under Saved

## 🆘 Support

- **Documentation**: See `DEVELOPMENT.md` for detailed guide
- **Contributing**: See `CONTRIBUTING.md` for guidelines
- **Issues**: Use GitHub issue templates
- **Changes**: See `CHANGELOG.md` for version history

---

**Status**: ✅ Production Ready | **Tests**: ✅ Passing | **Build**: ✅ Success | **Quality**: ✅
High
