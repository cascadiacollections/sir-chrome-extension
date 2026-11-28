import { expect } from 'chai';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { badgeFor } from '../app/scripts/badge.ts';
import { ShoutKitController } from '../app/scripts/controller.ts';
import { isFavorite, toggleFavorite } from '../app/scripts/favorites.ts';
import {
  extractIcyMetadata,
  parseIcyMetadataBlock,
  sniffIcyTitle,
} from '../app/scripts/icy.ts';
import {
  ALL_MIRRORS,
  RadioBrowserClient,
  buildClickUrl,
  buildSearchUrl,
  orderMirrors,
  parseServerList,
  toBaseUrl,
} from '../app/scripts/radio-browser.ts';
import {
  canRetryStream,
  directoryRetryDelayMs,
  streamRetryDelayMs,
} from '../app/scripts/retry.ts';
import {
  isPlayableStreamUrl,
  mapStation,
  stationFromUnknown,
} from '../app/scripts/stations.ts';
import { APP_VERSION, USER_AGENT } from '../app/scripts/version.ts';

const root = new URL('..', import.meta.url);

function readJson(path) {
  return JSON.parse(readFileSync(new URL(path, root), 'utf8'));
}

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      files.push(...walk(path));
    } else {
      files.push(path);
    }
  }
  return files;
}

const station = {
  id: '595687e1-9fa0-49d7-8cb7-d6ed63f6d8b3',
  name: 'Example FM',
  streamUrl: 'https://example.com/live.mp3',
  favicon: 'https://example.com/icon.png',
  countryCode: 'US',
  tags: 'jazz',
  codec: 'MP3',
  bitrate: 128,
};

function memoryStore(initial = { favorites: [], lastStation: null }) {
  const saved = { ...initial };
  return {
    saved,
    async load() {
      return {
        favorites: saved.favorites,
        lastStation: saved.lastStation,
      };
    },
    async save(library) {
      saved.favorites = library.favorites;
      saved.lastStation = library.lastStation;
    },
  };
}

function fakePlayer() {
  const player = {
    urls: [],
    failTimes: 0,
    listener: null,
    stopped: 0,
    setListener(listener) {
      player.listener = listener;
    },
    async play(url) {
      player.urls.push(url);
      if (player.urls.length <= player.failTimes) {
        throw new Error('down');
      }
    },
    async stop() {
      player.stopped += 1;
    },
    refreshMetadata() {},
  };
  return player;
}

async function until(predicate) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (predicate()) {
      return;
    }
    await new Promise(resolve => {
      setTimeout(resolve, 0);
    });
  }
  throw new Error('timed out waiting');
}

describe('ShoutKit extension', function () {
  describe('package identity', function () {
    it('keeps the manifest, package, and user agent on the same version', function () {
      const manifest = readJson('app/manifest.json');
      const firefox = readJson('app/manifest.firefox.json');
      const pkg = readJson('package.json');
      const rules = readJson('app/rules.json');
      expect(manifest.version).to.equal(APP_VERSION);
      expect(firefox.version).to.equal(APP_VERSION);
      expect(pkg.version).to.equal(APP_VERSION);
      expect(pkg.license).to.equal('MIT');
      expect(USER_AGENT).to.include(`ShoutKit-Extension/${APP_VERSION}`);
      expect(rules[0].action.requestHeaders[0].value).to.equal(USER_AGENT);
    });

    it('asks only for the permissions the directory, storage, and playback need', function () {
      const manifest = readJson('app/manifest.json');
      expect(manifest.permissions).to.deep.equal([
        'storage',
        'offscreen',
        'declarativeNetRequest',
      ]);
      expect(manifest.host_permissions).to.deep.equal([
        'https://*.api.radio-browser.info/*',
      ]);
      expect(manifest.optional_host_permissions).to.deep.equal([
        'http://*/*',
        'https://*/*',
      ]);
      expect(manifest.permissions).to.not.include('tabs');
      expect(manifest.permissions).to.not.include('activeTab');
      expect(manifest.background.service_worker).to.equal('dist/background.js');
      expect(manifest.action.default_popup).to.equal('popup.html');
    });

    it('keeps a Firefox manifest that does not require offscreen documents', function () {
      const firefox = readJson('app/manifest.firefox.json');
      expect(firefox.permissions).to.not.include('offscreen');
      expect(firefox.permissions).to.include('storage');
      expect(firefox.background.scripts).to.deep.equal(['dist/background.js']);
      expect(firefox.browser_specific_settings.gecko.id).to.include('shoutkit');
    });

    it('does not ship the old S.I.R stream as a station', function () {
      const sources = walk(new URL('app/scripts', root).pathname)
        .filter(path => path.endsWith('.ts'))
        .map(path => readFileSync(path, 'utf8'))
        .join('\n');
      const manifest = readFileSync(new URL('app/manifest.json', root), 'utf8');
      expect(sources).to.not.include('shoutcheap');
      expect(sources).to.not.include('smodcast');
      expect(manifest).to.not.include('shoutcheap');
    });
  });

  describe('stations', function () {
    it('maps a radio-browser record and prefers the resolved stream', function () {
      const mapped = mapStation({
        stationuuid: station.id,
        name: 'Example FM',
        url: 'https://example.com/playlist.m3u',
        url_resolved: 'https://example.com/live.mp3',
        favicon: 'https://example.com/icon.png',
        countrycode: 'us',
        tags: 'jazz',
        codec: 'MP3',
        bitrate: 128,
        hls: 0,
      });
      expect(mapped).to.deep.equal(station);
    });

    it('drops HLS playlists and non-http streams', function () {
      expect(
        mapStation({
          stationuuid: station.id,
          name: 'HLS',
          url_resolved: 'https://example.com/live.m3u8',
          hls: 1,
        })
      ).to.equal(null);
      expect(isPlayableStreamUrl('javascript:alert(1)')).to.equal(false);
      expect(
        stationFromUnknown({
          id: station.id,
          name: 'Nope',
          streamUrl: 'javascript:alert(1)',
        })
      ).to.equal(null);
      expect(
        stationFromUnknown({
          ...station,
          favicon: 'http://insecure.example/a.png',
        }).favicon
      ).to.equal('');
    });
  });

  describe('favorites', function () {
    it('saves, dedupes, and removes a station', function () {
      const saved = toggleFavorite([], station);
      expect(isFavorite(saved, station.id)).to.equal(true);
      const again = toggleFavorite(saved, { ...station, name: 'Renamed' });
      expect(again).to.have.length(0);
    });
  });

  describe('retry', function () {
    it('backs off stream reconnects and directory failover', function () {
      expect(canRetryStream(0)).to.equal(true);
      expect(canRetryStream(2)).to.equal(true);
      expect(canRetryStream(3)).to.equal(false);
      expect(streamRetryDelayMs(0)).to.equal(2000);
      expect(streamRetryDelayMs(1)).to.equal(4000);
      expect(streamRetryDelayMs(2)).to.equal(8000);
      expect(directoryRetryDelayMs(0)).to.equal(350);
      expect(directoryRetryDelayMs(1)).to.equal(700);
    });
  });

  describe('badges', function () {
    it('keeps off, connecting, on, and error states', function () {
      expect(
        badgeFor({
          phase: 'idle',
          station: null,
          trackTitle: '',
          trackArtist: '',
          retryCount: 0,
          statusText: '',
        }).text
      ).to.equal('OFF');
      expect(
        badgeFor({
          phase: 'connecting',
          station,
          trackTitle: '',
          trackArtist: '',
          retryCount: 1,
          statusText: '',
        }).text
      ).to.equal('...');
      expect(
        badgeFor({
          phase: 'playing',
          station,
          trackTitle: 'Song',
          trackArtist: 'Artist',
          retryCount: 0,
          statusText: 'Live',
        })
      ).to.include({ text: 'ON' });
      expect(
        badgeFor({
          phase: 'error',
          station,
          trackTitle: '',
          trackArtist: '',
          retryCount: 3,
          statusText: '',
        }).text
      ).to.equal('ERR');
    });
  });

  describe('ICY metadata', function () {
    it('reads a classic StreamTitle and keeps apostrophes', function () {
      expect(
        parseIcyMetadataBlock(
          "StreamTitle='Ada - Night Drive';StreamUrl='https://example.com';"
        )
      ).to.deep.equal({
        title: 'Night Drive',
        artist: 'Ada',
      });
      expect(parseIcyMetadataBlock("StreamTitle='Don't Stop';")).to.deep.equal({
        title: "Don't Stop",
        artist: '',
      });
    });

    it('reads split title and artist pairs', function () {
      expect(
        parseIcyMetadataBlock('title="Night Drive",artist="Ada"')
      ).to.deep.equal({
        title: 'Night Drive',
        artist: 'Ada',
      });
    });

    it('extracts the first metadata frame and ignores an empty one', function () {
      const meta = new TextEncoder().encode("StreamTitle='Ada - Night Drive';");
      const blocks = Math.ceil(meta.length / 16);
      const padded = new Uint8Array(blocks * 16);
      padded.set(meta);
      const buffer = new Uint8Array(4 + 1 + padded.length);
      buffer[4] = blocks;
      buffer.set(padded, 5);
      expect(extractIcyMetadata(buffer, 4)).to.include('Night Drive');
      const silent = new Uint8Array(5);
      silent[4] = 0;
      expect(extractIcyMetadata(silent, 4)).to.equal(null);
    });

    it('sniffs a title split across stream chunks', async function () {
      const meta = new TextEncoder().encode("StreamTitle='Ada - Night Drive';");
      const blocks = Math.ceil(meta.length / 16);
      const padded = new Uint8Array(blocks * 16);
      padded.set(meta);
      const frame = new Uint8Array(8 + 1 + padded.length);
      frame[8] = blocks;
      frame.set(padded, 9);
      const body = new ReadableStream({
        start(controller) {
          controller.enqueue(frame.subarray(0, 4));
          controller.enqueue(frame.subarray(4));
          controller.close();
        },
      });
      const fetchImpl = async (url, init) => {
        expect(url).to.equal('https://example.com/live.mp3');
        expect(init.headers['Icy-MetaData']).to.equal('1');
        return new Response(body, {
          status: 200,
          headers: { 'icy-metaint': '8' },
        });
      };
      const track = await sniffIcyTitle(
        'https://example.com/live.mp3',
        fetchImpl
      );
      expect(track).to.deep.equal({ title: 'Night Drive', artist: 'Ada' });
    });
  });

  describe('Radio Browser', function () {
    it('accepts only directory host names from the server list', function () {
      expect(toBaseUrl('de1.api.radio-browser.info')).to.equal(
        'https://de1.api.radio-browser.info'
      );
      expect(toBaseUrl('https://evil.example')).to.equal(null);
      expect(toBaseUrl('de1.api.radio-browser.info.evil.example')).to.equal(
        null
      );
      expect(toBaseUrl('notapi.radio-browser.info')).to.equal(null);
      const bases = parseServerList(
        JSON.stringify([
          { name: 'de1.api.radio-browser.info' },
          { name: 'de1.api.radio-browser.info' },
          { name: 'javascript:alert(1)' },
        ])
      );
      expect(bases).to.deep.equal(['https://de1.api.radio-browser.info']);
      expect(orderMirrors(bases, () => 0).at(-1)).to.equal(ALL_MIRRORS);
    });

    it('refuses to build a directory URL on any other host', function () {
      expect(() =>
        buildSearchUrl('https://evil.example', 'jazz', 10)
      ).to.throw();
      expect(() => buildClickUrl(ALL_MIRRORS, 'not-a-uuid')).to.throw();
    });

    it('discovers mirrors, fails over, and sends the ShoutKit user agent', async function () {
      const calls = [];
      const fetchImpl = async (url, init) => {
        calls.push({ url: String(url), agent: init.headers['User-Agent'] });
        if (String(url).endsWith('/json/servers')) {
          return new Response(
            JSON.stringify([
              { name: 'de1.api.radio-browser.info' },
              { name: 'de2.api.radio-browser.info' },
            ]),
            { status: 200 }
          );
        }
        if (String(url).startsWith('https://de2.api.radio-browser.info')) {
          return new Response('', { status: 503 });
        }
        return new Response(
          JSON.stringify([
            {
              stationuuid: station.id,
              name: station.name,
              url_resolved: station.streamUrl,
              countrycode: 'US',
              codec: 'MP3',
              bitrate: 128,
              favicon: station.favicon,
              tags: 'jazz',
              hls: 0,
            },
          ]),
          { status: 200 }
        );
      };
      const client = new RadioBrowserClient({
        fetchImpl,
        sleep: async () => {},
        random: () => 0,
        now: () => 1_000,
      });
      const found = await client.search('example', 25);
      expect(found).to.have.length(1);
      expect(found[0].name).to.equal('Example FM');
      expect(calls.every(call => call.agent === USER_AGENT)).to.equal(true);
      expect(calls.some(call => call.url.includes('/json/servers'))).to.equal(
        true
      );
      expect(
        calls.some(call =>
          call.url.startsWith('https://de2.api.radio-browser.info')
        )
      ).to.equal(true);
      expect(
        calls.some(call =>
          call.url.startsWith('https://de1.api.radio-browser.info')
        )
      ).to.equal(true);
    });

    it('reports one click and falls back to the known stream if reporting fails', async function () {
      const fetchImpl = async url => {
        if (String(url).endsWith('/json/servers')) {
          return new Response(
            JSON.stringify([{ name: 'de1.api.radio-browser.info' }]),
            {
              status: 200,
            }
          );
        }
        if (String(url).includes('/json/url/')) {
          return new Response(
            JSON.stringify({ ok: true, url: 'https://cdn.example/fresh.mp3' }),
            {
              status: 200,
            }
          );
        }
        return new Response('[]', { status: 200 });
      };
      const client = new RadioBrowserClient({
        fetchImpl,
        sleep: async () => {},
        now: () => 1_000,
      });
      const resolved = await client.resolveStream(station);
      expect(resolved.streamUrl).to.equal('https://cdn.example/fresh.mp3');

      const offline = new RadioBrowserClient({
        fetchImpl: async () => {
          throw new Error('offline');
        },
        sleep: async () => {},
        now: () => 1_000,
      });
      const custom = { ...station, id: 'custom-station' };
      const kept = await offline.resolveStream(custom);
      expect(kept.streamUrl).to.equal(station.streamUrl);
    });
  });

  describe('playback controller', function () {
    it('starts with nothing playing when no station has been chosen', async function () {
      const player = fakePlayer();
      const controller = new ShoutKitController({
        directory: {
          search: async () => [],
          topStations: async () => [],
          stationsByTag: async () => [],
          resolveStream: async value => value,
        },
        player,
        store: memoryStore(),
        sleep: async () => {},
      });
      await controller.start();
      expect(controller.snapshot().phase).to.equal('idle');
      expect(controller.snapshot().station).to.equal(null);
      await controller.toggle();
      expect(player.urls).to.deep.equal([]);
    });

    it('resolves the stream once and retries a drop without another click', async function () {
      let resolves = 0;
      const player = fakePlayer();
      player.failTimes = 2;
      const delays = [];
      const controller = new ShoutKitController({
        directory: {
          search: async () => [],
          topStations: async () => [],
          stationsByTag: async () => [],
          resolveStream: async value => {
            resolves += 1;
            return { ...value, streamUrl: 'https://cdn.example/fresh.mp3' };
          },
        },
        player,
        store: memoryStore(),
        sleep: async ms => {
          delays.push(ms);
        },
      });
      await controller.play(station);
      expect(resolves).to.equal(1);
      expect(player.urls).to.deep.equal([
        'https://cdn.example/fresh.mp3',
        'https://cdn.example/fresh.mp3',
        'https://cdn.example/fresh.mp3',
      ]);
      expect(delays).to.deep.equal([2000, 4000]);
      expect(controller.snapshot().phase).to.equal('playing');
      expect(controller.snapshot().station.name).to.equal('Example FM');
    });

    it('stops retrying after three reconnects', async function () {
      const player = fakePlayer();
      player.failTimes = 10;
      const controller = new ShoutKitController({
        directory: {
          search: async () => [],
          topStations: async () => [],
          stationsByTag: async () => [],
          resolveStream: async value => value,
        },
        player,
        store: memoryStore(),
        sleep: async () => {},
      });
      await controller.play(station);
      expect(player.urls).to.have.length(4);
      expect(controller.snapshot().phase).to.equal('error');
      expect(controller.snapshot().statusText).to.equal(
        'This station is unavailable.'
      );
    });

    it('does not reconnect after the listener stops playback', async function () {
      const player = fakePlayer();
      player.failTimes = 10;
      let release = () => {};
      const delays = [];
      const controller = new ShoutKitController({
        directory: {
          search: async () => [],
          topStations: async () => [],
          stationsByTag: async () => [],
          resolveStream: async value => value,
        },
        player,
        store: memoryStore(),
        sleep: ms =>
          new Promise(resolve => {
            delays.push(ms);
            release = resolve;
          }),
      });
      const pending = controller.play(station);
      await until(() => delays.length === 1);
      await controller.stop();
      release();
      await pending;
      expect(player.urls).to.have.length(1);
      expect(controller.snapshot().phase).to.equal('idle');
    });

    it('stores a favorite and the last station without starting playback on launch', async function () {
      const player = fakePlayer();
      const store = memoryStore();
      const controller = new ShoutKitController({
        directory: {
          search: async () => [station],
          topStations: async () => [station],
          stationsByTag: async () => [],
          resolveStream: async value => value,
        },
        player,
        store,
        sleep: async () => {},
      });
      await controller.toggleFavorite(station);
      expect(controller.favorites().map(item => item.id)).to.deep.equal([
        station.id,
      ]);
      await controller.play(station);
      await controller.stop();
      const reloaded = new ShoutKitController({
        directory: {
          search: async () => [],
          topStations: async () => [],
          stationsByTag: async () => [],
          resolveStream: async value => value,
        },
        player: fakePlayer(),
        store,
        sleep: async () => {},
      });
      await reloaded.start();
      expect(reloaded.snapshot().phase).to.equal('idle');
      expect(reloaded.snapshot().station.id).to.equal(station.id);
      expect(reloaded.favorites()).to.have.length(1);
      expect(player.urls).to.have.length(1);
    });
  });
});
