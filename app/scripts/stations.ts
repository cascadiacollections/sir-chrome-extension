export interface Station {
  id: string;
  name: string;
  streamUrl: string;
  favicon: string;
  countryCode: string;
  tags: string;
  codec: string;
  bitrate: number;
}

const STATION_ID = /^[A-Za-z0-9_-]{1,80}$/;
const RADIO_BROWSER_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isRadioBrowserUuid(id: string): boolean {
  return RADIO_BROWSER_UUID.test(id);
}

export function isPlayableStreamUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return false;
    }
    if (url.username || url.password) {
      return false;
    }
    return url.hostname.length > 0;
  } catch {
    return false;
  }
}

function isHls(streamUrl: string, hlsFlag: unknown): boolean {
  if (hlsFlag === 1 || hlsFlag === '1' || hlsFlag === true) {
    return true;
  }
  const path = streamUrl.toLowerCase().split('?')[0] ?? '';
  return path.endsWith('.m3u8');
}

function text(value: unknown, max: number): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().slice(0, max);
}

function bitrateOf(value: unknown): number {
  const number = typeof value === 'number' ? value : Number.NaN;
  if (!Number.isFinite(number) || number <= 0) {
    return 0;
  }
  return Math.min(Math.round(number), 10000);
}

function httpsUrl(value: unknown): string {
  const raw = text(value, 500);
  if (!raw) {
    return '';
  }
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

export function stationFromUnknown(value: unknown): Station | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const raw = value as Record<string, unknown>;
  const id = text(raw['id'], 80);
  const name = text(raw['name'], 200);
  const streamUrl = text(raw['streamUrl'], 2000);
  if (!STATION_ID.test(id) || !name || !isPlayableStreamUrl(streamUrl)) {
    return null;
  }
  if (isHls(streamUrl, raw['hls'])) {
    return null;
  }
  return {
    id,
    name,
    streamUrl,
    favicon: httpsUrl(raw['favicon']),
    countryCode: text(raw['countryCode'], 8).toUpperCase(),
    tags: text(raw['tags'], 300),
    codec: text(raw['codec'], 20),
    bitrate: bitrateOf(raw['bitrate']),
  };
}

/**
 * Map one radio-browser.info station object. HLS playlists are dropped:
 * Chrome's audio element does not play them, and ShoutKit's native apps use
 * a platform player that does.
 */
export function mapStation(value: unknown): Station | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const raw = value as Record<string, unknown>;
  const resolved = text(raw['url_resolved'], 2000);
  const original = text(raw['url'], 2000);
  const streamUrl = resolved || original;
  return stationFromUnknown({
    id: text(raw['stationuuid'], 80),
    name: text(raw['name'], 200),
    streamUrl,
    favicon: text(raw['favicon'], 500),
    countryCode: text(raw['countrycode'], 8),
    tags: text(raw['tags'], 300),
    codec: text(raw['codec'], 20),
    bitrate: raw['bitrate'],
    hls: raw['hls'],
  });
}

export function stationSubtitle(station: Station): string {
  const parts: string[] = [];
  if (station.countryCode) {
    parts.push(station.countryCode);
  }
  if (station.codec) {
    parts.push(station.codec.toUpperCase());
  }
  if (station.bitrate > 0) {
    parts.push(`${station.bitrate} kbps`);
  }
  return parts.join(' · ');
}

export function trackLabel(title: string, artist: string): string {
  if (artist && title) {
    return `${artist} — ${title}`;
  }
  return title || artist;
}
