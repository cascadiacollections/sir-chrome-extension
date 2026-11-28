export interface IcyTrack {
  title: string;
  artist: string;
}

const MAX_METAINT = 64 * 1024;

function isSeparator(character: string): boolean {
  return character === ';' || character === ',' || /\s/.test(character);
}

/**
 * Index of the quote that ends a value. An apostrophe inside a title
 * (`Don't Stop`) is kept because it is not followed by a field break.
 */
function findClosingQuote(text: string, from: number, quote: string): number {
  let search = from;
  while (search < text.length) {
    const index = text.indexOf(quote, search);
    if (index === -1) {
      return -1;
    }
    const after = text.charAt(index + 1);
    if (after === '' || isSeparator(after)) {
      return index;
    }
    search = index + 1;
  }
  return -1;
}

function splitFields(raw: string): Record<string, string> | null {
  const fields: Record<string, string> = {};
  let cursor = 0;
  while (cursor < raw.length) {
    while (cursor < raw.length && isSeparator(raw.charAt(cursor))) {
      cursor += 1;
    }
    if (cursor >= raw.length) {
      break;
    }
    const equals = raw.indexOf('=', cursor);
    if (equals <= cursor) {
      return null;
    }
    const key = raw.slice(cursor, equals).trim().toLowerCase();
    if (!/^[a-z0-9_]+$/.test(key)) {
      return null;
    }
    cursor = equals + 1;
    const quote = raw.charAt(cursor);
    if (quote === "'" || quote === '"') {
      cursor += 1;
      const close = findClosingQuote(raw, cursor, quote);
      if (close === -1) {
        fields[key] = raw.slice(cursor).trim();
        break;
      }
      fields[key] = raw.slice(cursor, close);
      cursor = close + 1;
    } else {
      let end = cursor;
      while (end < raw.length && !isSeparator(raw.charAt(end))) {
        end += 1;
      }
      fields[key] = raw.slice(cursor, end).trim();
      cursor = end;
    }
  }
  if (!fields['streamtitle'] && !fields['title'] && !fields['artist']) {
    return null;
  }
  return fields;
}

function splitArtistTitle(value: string): IcyTrack | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const separator = trimmed.indexOf(' - ');
  if (separator <= 0) {
    return { title: trimmed, artist: '' };
  }
  const artist = trimmed.slice(0, separator).trim();
  const title = trimmed.slice(separator + 3).trim();
  if (!artist || !title) {
    return { title: trimmed, artist: '' };
  }
  return { title, artist };
}

/**
 * Classic ICY (`StreamTitle='Artist - Song';`) and already-split
 * `title` / `artist` pairs. Anything that does not carry a title is ignored
 * so cue metadata is not shown as the song.
 */
export function parseIcyMetadataBlock(raw: string): IcyTrack | null {
  const trimmed = raw.replace(/\0/g, '').trim();
  if (!trimmed) {
    return null;
  }
  const fields = splitFields(trimmed);
  if (!fields) {
    if (trimmed.includes('=')) {
      return null;
    }
    return splitArtistTitle(trimmed);
  }
  const streamTitle = fields['streamtitle'];
  if (streamTitle !== undefined) {
    return splitArtistTitle(streamTitle);
  }
  const title = (fields['title'] ?? '').trim();
  const artist = (fields['artist'] ?? '').trim();
  if (!title && !artist) {
    return null;
  }
  return { title, artist };
}

/** Pull the first metadata frame out of an ICY byte stream. */
export function extractIcyMetadata(
  buffer: Uint8Array,
  metaint: number
): string | null {
  if (!Number.isInteger(metaint) || metaint <= 0 || metaint > MAX_METAINT) {
    return null;
  }
  if (buffer.length < metaint + 1) {
    return null;
  }
  const length = (buffer[metaint] ?? 0) * 16;
  if (length === 0) {
    return null;
  }
  const start = metaint + 1;
  if (buffer.length < start + length) {
    return null;
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(
    buffer.subarray(start, start + length)
  );
}

function concatChunks(
  chunks: readonly Uint8Array[],
  received: number
): Uint8Array {
  const buffer = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }
  return buffer;
}

/**
 * Open the stream just long enough to read one ICY title, then cancel.
 * Playback uses a separate audio element; this request is not the one
 * the listener hears.
 */
export async function sniffIcyTitle(
  url: string,
  fetchImpl: typeof fetch,
  signal?: AbortSignal
): Promise<IcyTrack | null> {
  if (!isHttpUrl(url)) {
    return null;
  }
  const init: RequestInit = {
    headers: { 'Icy-MetaData': '1' },
  };
  if (signal) {
    init.signal = signal;
  }
  const response = await fetchImpl(url, init);
  const metaint = Number(response.headers.get('icy-metaint'));
  if (
    !response.ok ||
    !response.body ||
    !Number.isInteger(metaint) ||
    metaint <= 0 ||
    metaint > MAX_METAINT
  ) {
    await response.body?.cancel().catch(() => undefined);
    return null;
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  const pullUntil = async (needed: number): Promise<Uint8Array | null> => {
    while (received < needed) {
      const next = await reader.read();
      if (next.done || !next.value) {
        return null;
      }
      chunks.push(next.value);
      received += next.value.length;
      if (received > MAX_METAINT + 4080) {
        return null;
      }
    }
    return concatChunks(chunks, received);
  };
  try {
    const head = await pullUntil(metaint + 1);
    if (!head) {
      return null;
    }
    const metadataLength = (head[metaint] ?? 0) * 16;
    if (metadataLength === 0) {
      return null;
    }
    const frame = await pullUntil(metaint + 1 + metadataLength);
    if (!frame) {
      return null;
    }
    const raw = extractIcyMetadata(frame, metaint);
    return raw ? parseIcyMetadataBlock(raw) : null;
  } finally {
    await reader.cancel().catch(() => undefined);
  }
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}
