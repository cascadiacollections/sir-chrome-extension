# GitHub Copilot instructions for the ShoutKit extension

## Project

Manifest V3 browser extension for ShoutKit. Users search
[Radio Browser](https://www.radio-browser.info/) and play a station in the background. There is no
hard-coded default stream. SModcast Internet Radio (S.I.R) is not a preset: its old URLs were dead
as of 2026-11-28 (see `CHANGELOG.md`).

Chrome and Edge use `app/manifest.json` (service worker + offscreen document). Firefox uses
`app/manifest.firefox.json` (background script, no `offscreen` permission) because that background
page can construct `Audio`.

## Layout

- `app/scripts/radio-browser.ts` — mirror discovery, failover, play reports. Do not hard-code a
  single Radio Browser host. Send `USER_AGENT` from `version.ts`. Report `/json/url/{uuid}` only on
  a user-initiated play.
- `app/scripts/controller.ts` — playback and favorites. Keep it free of `chrome.*` so tests can fake
  the directory, player, and store.
- `app/scripts/audio-engine.ts` — `HTMLAudioElement` plus a short ICY read. Reconnects: three tries,
  2s / 4s / 8s. Do not count another Radio Browser click on retry.
- `app/scripts/offscreen-player.ts` — Chromium path. Service workers have no DOM.
- `app/scripts/popup.ts` — toolbar UI. Build DOM nodes; do not assign station text with `innerHTML`.
- `app/scripts/background.ts` — wires Chrome APIs to the controller.

## Permissions

Keep them minimal. Required: `storage`, `offscreen` (Chromium manifest only),
`declarativeNetRequest` for the Radio Browser User-Agent, and
`https://*.api.radio-browser.info/*`. Song titles use optional host permissions and must keep
working if the user declines. No analytics, no API keys, no Shoutcast developer key.

## Checks

```bash
npm test
npm run lint
npm run type-check
npm run build
```

Tests import TypeScript via `node --experimental-strip-types` and `test/register.mjs`. New playback
or directory behavior belongs in those unit tests.

## Style

Strict TypeScript, private fields, no `any`, braces on every control-flow body. Prettier is the
formatter (`npm run format`). The license is MIT. Do not relicense to GPL-3.0; the ShoutKit apps are
GPL and their reusable packages are MIT, and any change here is a decision to record, not to make
silently.
