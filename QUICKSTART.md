# Quick start

ShoutKit is a browser extension that searches Radio Browser and plays a station in the background.
The old one-station S.I.R stream is not built in. See the README for why.

## First time

```bash
git clone https://github.com/cascadiacollections/sir-chrome-extension.git
cd sir-chrome-extension
npm install
npm test
npm run build
```

## Load in Chrome

1. Open `chrome://extensions/`
2. Turn on Developer mode
3. Load unpacked and choose the `app` folder
4. Open the ShoutKit toolbar popup, search or pick a popular station, then press play

Firefox: copy `app/manifest.firefox.json` over `app/manifest.json` before loading. Use
`app/manifest.json` for Chrome and Edge.

## Commands

| Command               | Description                        |
| --------------------- | ---------------------------------- |
| `npm run build:dev`   | Development build with source maps |
| `npm run build:watch` | Rebuild while you edit             |
| `npm run build`       | Production build                   |
| `npm test`            | Unit tests                         |
| `npm run lint`        | Lint TypeScript                    |
| `npm run type-check`  | `tsc --noEmit`                     |
| `npm run pre-commit`  | Format, lint, type-check, and test |

Playback continues after the popup closes. The badge reads `OFF`, `...`, `ON`, or `ERR`.
`Ctrl+Shift+9` (Command+Shift+9 on macOS) plays or stops the current station.

## Need help?

- [Onboarding](ONBOARDING.md)
- [Development](DEVELOPMENT.md)
- [Contributing](CONTRIBUTING.md)
- [Issues](https://github.com/cascadiacollections/sir-chrome-extension/issues)
