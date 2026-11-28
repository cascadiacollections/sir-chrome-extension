# ShoutKit

Browser extension for [ShoutKit](https://github.com/cascadiacollections/shoutkit), the free and
open-source internet radio family. Search and play stations from
[Radio Browser](https://www.radio-browser.info/), keep favorites in this browser, and leave the
stream running after the toolbar popup closes.

This repository used to be a one-station player for SModcast Internet Radio (S.I.R). That stream is
gone; see [Why S.I.R is not built in](#why-sir-is-not-built-in). Nothing plays until you pick a
station.

> **Quick links**: [Quickstart](QUICKSTART.md) · [Development](DEVELOPMENT.md) ·
> [Contributing](CONTRIBUTING.md)

[![CI](https://github.com/cascadiacollections/shoutkit-browser-extension/actions/workflows/ci.yml/badge.svg)](https://github.com/cascadiacollections/shoutkit-browser-extension/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

ShoutKit on other platforms: [iOS and Apple TV](https://github.com/cascadiacollections/shoutkit) ·
[Android](https://github.com/cascadiacollections/shoutkit-android)

## Features

- Search Radio Browser by name, or browse popular stations and a few genres
- Play a station in the background (Chrome/Edge: an offscreen document; the popup can close)
- Stop and start from the popup, or with the `Ctrl+Shift+9` / `Command+Shift+9` command
- Save favorites with `chrome.storage.local` (this browser only)
- Toolbar badge for idle, connecting, playing, and error (`OFF`, `...`, `ON`, `ERR`)
- Reconnect if a stream drops: three tries, waiting 2s, then 4s, then 8s
- Optional ICY song titles. Playback does not need that permission
- No accounts, no analytics, no API keys

HLS (`.m3u8`) stations are skipped. Chrome's audio element does not play them; the native ShoutKit
apps use a platform player that does.

## Install from source

Chrome, Edge, and other Chromium browsers:

```bash
git clone https://github.com/cascadiacollections/shoutkit-browser-extension.git
cd shoutkit-browser-extension
npm install
npm run build
```

Load the `app` folder as an unpacked extension on `chrome://extensions` (Developer mode → Load
unpacked). This package is not published to the Chrome Web Store from this branch.

### Firefox

Firefox has no offscreen-document API, and its background page can play audio directly. Before
loading the extension, copy `app/manifest.firefox.json` over `app/manifest.json`. The Firefox
manifest omits the Chromium-only `offscreen` permission and uses a background script instead of a
service worker. Chrome and Edge should keep `app/manifest.json`.

## Permissions

| Permission                              | Why                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| `storage`                               | Favorites and the last station, on this browser only                                        |
| `offscreen`                             | Chrome MV3 service workers cannot play audio. Required on Chromium, omitted for Firefox     |
| `declarativeNetRequest`                 | Sets the User-Agent Radio Browser asks clients to send. Limited to `api.radio-browser.info` |
| `https://*.api.radio-browser.info/*`    | Station search, mirror discovery, and play reports                                          |
| optional `http://*/*` and `https://*/*` | Only if you turn on song titles, so the extension can read ICY metadata from that station   |

Song titles are off until you click **Enable song titles**. Chrome will describe that as access to
the sites you play. The audio itself plays without it. Declining the prompt does not stop playback.

## How station data is loaded

Radio Browser has no single stable host and no API key. The extension follows the published client
guidance as far as a browser can:

1. Discover mirrors with `GET https://all.api.radio-browser.info/json/servers`. A browser extension
   cannot do the documented DNS lookup, so this is the HTTP fallback. If discovery fails, a short
   built-in list is used, and `all.api.radio-browser.info` stays last so a healthy mirror can still
   be reached.
2. Spread later requests across the mirrors and fail over (at most three tries, 350ms then 700ms).
3. Send
   `User-Agent: ShoutKit-Extension/<version> (+https://github.com/cascadiacollections/shoutkit-browser-extension)`.
4. When you press play on a Radio Browser station, call `/json/url/{stationuuid}` once. That counts
   the play and returns a fresh stream URL. Automatic reconnects do not count another play.

No Shoutcast directory key is used.

## Why S.I.R is not built in

Checked on 28 November 2026. The stream this extension used to play,
`https://broadcast.shoutcheap.com/proxy/willradio/stream`, returned **HTTP 502 Bad Gateway**
(`Server: cc-web/1.6.3`, HTML error page). The host itself answered on `/`; the station proxy did
not. The playlist still linked from `https://www.smodcast.com/sir`
(`https://cp12.shoutcheap.com:2199/tunein/willradio.pls`) presents a certificate for
`radio.shoutcheap.com` only, and the account response is
`Unable to access account for willradio: Invalid username or password`. Radio Browser has no station
named SModcast.

A preset that only errors is not useful, so S.I.R is not selectable and is not the default. The
probe details are in the changelog. If the station comes back, it can be added as a curated station
or listed in Radio Browser.

## Development

Node.js >= 24 and npm >= 10.

```bash
npm install
npm test
npm run lint
npm run type-check
npm run build
npm run build:watch
```

```
app/
├── manifest.json              # Chromium (Chrome, Edge)
├── manifest.firefox.json      # Firefox background-page manifest
├── popup.html                 # Toolbar UI
├── offscreen.html             # Chromium audio document
├── rules.json                 # User-Agent for Radio Browser only
├── scripts/                   # TypeScript source
└── dist/                      # Webpack output (generated)
```

Tests cover station mapping, Radio Browser failover, favorites, ICY titles, and the reconnect
policy. They do not open a browser.

## Privacy

ShoutKit does not add analytics, accounts, or tracking. Traffic you cause by using it:

- Directory queries to Radio Browser (search text, genre, station id)
- One play report per play, the station's public id only
- The audio stream, requested from the station you chose
- A short extra request to that same station for the ICY title, only while a station is playing and
  only if the request is allowed (song-title permission, or a station that already sends CORS)

Favorites stay in `chrome.storage.local`.

## License

MIT. See [LICENSE](LICENSE).

The ShoutKit iOS and Android **apps** are GPL-3.0. Their reusable packages are MIT. This extension
stays MIT: it is new browser code written against the public Radio Browser and ICY formats, not a
copy of those GPL app targets.

The ShoutKit name and the toolbar icon (resized from the iOS repo's `site/assets/app-icon-256.png`)
are the family's branding. The iOS repo's `TRADEMARK.md` says that branding is not part of the code
license.

## Repository

Source:
[cascadiacollections/shoutkit-browser-extension](https://github.com/cascadiacollections/shoutkit-browser-extension)
(being renamed from `sir-chrome-extension`). This tree does not publish a release or a Web Store listing.
