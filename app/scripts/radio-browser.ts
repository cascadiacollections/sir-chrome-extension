import { DIRECTORY_MAX_ATTEMPTS, directoryRetryDelayMs } from './retry';
import {
  mapStation,
  isRadioBrowserUuid,
  isPlayableStreamUrl,
  type Station,
} from './stations';
import { USER_AGENT } from './version';

/**
 * radio-browser.info has no single stable host. Clients are asked to discover
 * mirrors, spread load, fail over, send a speaking User-Agent, and report a
 * play with `/json/url/{stationuuid}`.
 *
 * A browser extension cannot do the documented DNS lookup of
 * `all.api.radio-browser.info`, so discovery uses the HTTP fallback
 * `GET /json/servers` on that same round-robin name, then the built-in mirror
 * list. `all.api.radio-browser.info` is always kept as the last resort.
 */
export const ALL_MIRRORS = 'https://all.api.radio-browser.info';
export const DISCOVERY_URL = `${ALL_MIRRORS}/json/servers`;

export const FALLBACK_MIRRORS: readonly string[] = [
  'https://de1.api.radio-browser.info',
  'https://de2.api.radio-browser.info',
  'https://at1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  ALL_MIRRORS,
];

const DIRECTORY_HOST =
  /^https:\/\/(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)*api\.radio-browser\.info$/;
const HOST_NAME =
  /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;

const DISCOVERY_TTL_MS = 24 * 60 * 60 * 1000;
const DISCOVERY_FAILURE_TTL_MS = 10 * 60 * 1000;
const TOP_CACHE_TTL_MS = 60 * 1000;

export class DirectoryError extends Error {
  readonly retryable: boolean;
  readonly status: number;

  constructor(message: string, retryable: boolean, status = 0) {
    super(message);
    this.name = 'DirectoryError';
    this.retryable = retryable;
    this.status = status;
  }
}

export function isDirectoryBase(value: string): boolean {
  return DIRECTORY_HOST.test(value);
}

export function toBaseUrl(name: string): string | null {
  const host = name.trim().replace(/\.+$/, '').toLowerCase();
  if (
    !host.endsWith('.api.radio-browser.info') &&
    host !== 'api.radio-browser.info'
  ) {
    return null;
  }
  if (!HOST_NAME.test(host)) {
    return null;
  }
  const base = `https://${host}`;
  return isDirectoryBase(base) ? base : null;
}

export function parseServerList(body: string): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) {
    return [];
  }
  const bases: string[] = [];
  for (const entry of parsed) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }
    const name = (entry as Record<string, unknown>)['name'];
    if (typeof name !== 'string') {
      continue;
    }
    const base = toBaseUrl(name);
    if (base && !bases.includes(base)) {
      bases.push(base);
    }
  }
  return bases;
}

export function orderMirrors(
  mirrors: readonly string[],
  random: () => number = Math.random
): string[] {
  const unique: string[] = [];
  for (const base of mirrors) {
    if (
      !isDirectoryBase(base) ||
      base === ALL_MIRRORS ||
      unique.includes(base)
    ) {
      continue;
    }
    unique.push(base);
  }
  for (let index = unique.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = unique[index];
    const other = unique[swap];
    if (current === undefined || other === undefined) {
      continue;
    }
    unique[index] = other;
    unique[swap] = current;
  }
  return [...unique, ALL_MIRRORS];
}

export function parseStationList(body: string): Station[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new DirectoryError('Directory returned malformed JSON', false);
  }
  if (!Array.isArray(parsed)) {
    throw new DirectoryError('Directory returned an unexpected list', false);
  }
  const stations: Station[] = [];
  for (const entry of parsed) {
    const station = mapStation(entry);
    if (station) {
      stations.push(station);
    }
  }
  return stations;
}

export function parseClickUrl(body: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new DirectoryError('Click response was malformed', false);
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new DirectoryError('Click response was empty', false);
  }
  const url = (parsed as Record<string, unknown>)['url'];
  if (typeof url !== 'string' || !isPlayableStreamUrl(url)) {
    throw new DirectoryError('Click response had no stream', false);
  }
  return url;
}

function directoryUrl(
  base: string,
  path: string,
  params: Record<string, string>
): string {
  if (!isDirectoryBase(base)) {
    throw new DirectoryError('Refusing a non-directory host', false);
  }
  const url = new URL(path, `${base}/`);
  if (!isDirectoryBase(url.origin)) {
    throw new DirectoryError('Refusing a non-directory host', false);
  }
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export function buildSearchUrl(
  base: string,
  query: string,
  limit: number
): string {
  return directoryUrl(base, '/json/stations/search', {
    name: query,
    limit: String(limit),
    hidebroken: 'true',
    order: 'clickcount',
    reverse: 'true',
  });
}

export function buildTopClickUrl(base: string, limit: number): string {
  return directoryUrl(base, '/json/stations/topclick', {
    limit: String(limit),
    hidebroken: 'true',
  });
}

export function buildTagUrl(base: string, tag: string, limit: number): string {
  return directoryUrl(base, '/json/stations/search', {
    tag: tag.toLowerCase(),
    limit: String(limit),
    hidebroken: 'true',
    order: 'clickcount',
    reverse: 'true',
  });
}

export function buildClickUrl(base: string, stationUuid: string): string {
  if (!isRadioBrowserUuid(stationUuid)) {
    throw new DirectoryError(
      'Refusing to report a non-directory station',
      false
    );
  }
  return directoryUrl(base, `/json/url/${stationUuid}`, {});
}

export interface RadioBrowserDeps {
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  random?: () => number;
  userAgent?: string;
}

interface MirrorSnapshot {
  bases: string[];
  expiresAt: number;
}

/**
 * One directory client. Mirror discovery is cached, popular stations are
 * cached for a minute, and each logical call tries at most three mirrors.
 */
export class RadioBrowserClient {
  readonly #fetchImpl: typeof fetch;
  readonly #sleep: (ms: number) => Promise<void>;
  readonly #now: () => number;
  readonly #random: () => number;
  readonly #userAgent: string;
  #mirrors: MirrorSnapshot | null = null;
  #topCache: { at: number; limit: number; stations: Station[] } | null = null;

  constructor(deps: RadioBrowserDeps = {}) {
    // `fetch` throws "Illegal invocation" in a service worker if it is detached
    // from the global and called as a bare function.
    this.#fetchImpl = deps.fetchImpl ?? fetch.bind(globalThis);
    const defaultSleep = (ms: number): Promise<void> =>
      new Promise(resolve => {
        setTimeout(resolve, ms);
      });
    this.#sleep = deps.sleep ?? defaultSleep;
    this.#now = deps.now ?? ((): number => Date.now());
    this.#random = deps.random ?? Math.random;
    this.#userAgent = deps.userAgent ?? USER_AGENT;
  }

  async search(query: string, limit: number): Promise<Station[]> {
    const name = query.trim();
    if (!name) {
      return [];
    }
    return this.#stations(base =>
      buildSearchUrl(base, name, clampLimit(limit))
    );
  }

  async topStations(limit: number): Promise<Station[]> {
    const clamped = clampLimit(limit);
    const cached = this.#topCache;
    if (
      cached &&
      cached.limit >= clamped &&
      this.#now() - cached.at < TOP_CACHE_TTL_MS
    ) {
      return cached.stations.slice(0, clamped);
    }
    const stations = await this.#stations(base =>
      buildTopClickUrl(base, clamped)
    );
    this.#topCache = { at: this.#now(), limit: clamped, stations };
    return stations;
  }

  async stationsByTag(tag: string, limit: number): Promise<Station[]> {
    const normalized = tag.trim().toLowerCase();
    if (!/^[a-z0-9 -]{1,40}$/.test(normalized)) {
      return [];
    }
    return this.#stations(base =>
      buildTagUrl(base, normalized, clampLimit(limit))
    );
  }

  /**
   * Count the play and prefer the fresh stream URL. A reporting failure
   * still returns the station so playback is not blocked on the statistic.
   * Automatic reconnects must not call this again.
   */
  async resolveStream(station: Station): Promise<Station> {
    if (!isRadioBrowserUuid(station.id)) {
      return station;
    }
    try {
      const url = await this.#request(
        base => buildClickUrl(base, station.id),
        parseClickUrl
      );
      if (
        isPlayableStreamUrl(url) &&
        !url.toLowerCase().split('?')[0]?.endsWith('.m3u8')
      ) {
        return { ...station, streamUrl: url };
      }
    } catch {
      return station;
    }
    return station;
  }

  async #stations(pathFor: (base: string) => string): Promise<Station[]> {
    return this.#request(pathFor, parseStationList);
  }

  async #request<T>(
    pathFor: (base: string) => string,
    parse: (body: string) => T
  ): Promise<T> {
    const mirrors = await this.#mirrorList();
    let last: DirectoryError | null = null;
    for (let attempt = 0; attempt < DIRECTORY_MAX_ATTEMPTS; attempt += 1) {
      const base = mirrors[attempt % mirrors.length] ?? ALL_MIRRORS;
      try {
        const body = await this.#fetchText(pathFor(base));
        return parse(body);
      } catch (error) {
        last =
          error instanceof DirectoryError
            ? error
            : new DirectoryError('Directory request failed', false);
        if (!last.retryable || attempt === DIRECTORY_MAX_ATTEMPTS - 1) {
          break;
        }
        await this.#sleep(directoryRetryDelayMs(attempt));
      }
    }
    throw last ?? new DirectoryError('No directory mirror available', true);
  }

  async #mirrorList(): Promise<string[]> {
    const cached = this.#mirrors;
    if (cached && this.#now() < cached.expiresAt) {
      return orderMirrors(cached.bases, this.#random);
    }
    try {
      const body = await this.#fetchText(DISCOVERY_URL);
      const discovered = parseServerList(body);
      if (discovered.length === 0) {
        throw new DirectoryError('Directory returned no mirrors', true);
      }
      this.#mirrors = {
        bases: discovered,
        expiresAt: this.#now() + DISCOVERY_TTL_MS,
      };
      return orderMirrors(discovered, this.#random);
    } catch {
      this.#mirrors = {
        bases: [...FALLBACK_MIRRORS],
        expiresAt: this.#now() + DISCOVERY_FAILURE_TTL_MS,
      };
      return orderMirrors(FALLBACK_MIRRORS, this.#random);
    }
  }

  async #fetchText(url: string): Promise<string> {
    let response: Response;
    try {
      response = await this.#fetchImpl(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': this.#userAgent,
        },
        signal: AbortSignal.timeout(12_000),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error';
      throw new DirectoryError(message, true);
    }
    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      throw new DirectoryError(
        `Directory responded ${response.status}`,
        retryable,
        response.status
      );
    }
    const body = await response.text();
    if (body.trim() === '') {
      throw new DirectoryError('Directory returned an empty body', true);
    }
    return body;
  }
}

function clampLimit(limit: number): number {
  if (!Number.isFinite(limit)) {
    return 1;
  }
  return Math.min(100, Math.max(1, Math.floor(limit)));
}

export const DIRECTORY_UNAVAILABLE =
  "Couldn't reach Radio Browser. Check your connection and try again.";
