/// <reference types="chrome-types" />

import type { PlaybackSnapshot } from './badge';
import type { ExtensionPush, ExtensionResponse } from './protocol';
import { isFavorite } from './favorites';
import { stationSubtitle, trackLabel, type Station } from './stations';

type Chip =
  'popular' | 'saved' | 'rock' | 'jazz' | 'news' | 'classical' | 'electronic';

function isResponse(value: unknown): value is ExtensionResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record['ok'] === 'boolean' && typeof record['snapshot'] === 'object'
  );
}

function initPopup(doc: Document): void {
  const stationName = doc.getElementById('station-name');
  const trackName = doc.getElementById('track-name');
  const transport = doc.getElementById('transport');
  const favorite = doc.getElementById('favorite');
  const searchForm = doc.getElementById('search-form');
  const search = doc.getElementById('search');
  const list = doc.getElementById('list');
  const banner = doc.getElementById('banner');
  const metadata = doc.getElementById('metadata');
  if (
    !(stationName instanceof HTMLElement) ||
    !(trackName instanceof HTMLElement) ||
    !(transport instanceof HTMLButtonElement) ||
    !(favorite instanceof HTMLButtonElement) ||
    !(searchForm instanceof HTMLFormElement) ||
    !(search instanceof HTMLInputElement) ||
    !(list instanceof HTMLElement) ||
    !(banner instanceof HTMLElement) ||
    !(metadata instanceof HTMLButtonElement)
  ) {
    return;
  }

  let snapshot: PlaybackSnapshot = {
    phase: 'idle',
    station: null,
    trackTitle: '',
    trackArtist: '',
    retryCount: 0,
    statusText: 'Pick a station',
  };
  let favorites: Station[] = [];
  let stations: Station[] = [];
  let chip: Chip = 'popular';
  let searchTimer: ReturnType<typeof setTimeout> | null = null;

  const chips = Array.from(
    doc.querySelectorAll<HTMLButtonElement>('.chips button')
  );

  const renderNow = (): void => {
    const station = snapshot.station;
    stationName.textContent = station?.name ?? 'Nothing playing';
    if (snapshot.phase === 'playing') {
      const track = trackLabel(snapshot.trackTitle, snapshot.trackArtist);
      trackName.textContent = track || 'Live';
    } else {
      trackName.textContent = snapshot.statusText;
    }
    const playing =
      snapshot.phase === 'playing' || snapshot.phase === 'connecting';
    transport.textContent = playing ? 'Stop' : 'Play';
    transport.disabled = !playing && !station;
    transport.setAttribute(
      'aria-label',
      playing ? 'Stop playback' : 'Play station'
    );
    if (!station) {
      favorite.hidden = true;
      return;
    }
    favorite.hidden = false;
    const saved = isFavorite(favorites, station.id);
    favorite.setAttribute('aria-pressed', String(saved));
    favorite.setAttribute(
      'aria-label',
      saved ? 'Remove from saved stations' : 'Save station'
    );
    favorite.textContent = saved ? '♥' : '♡';
  };

  const renderList = (): void => {
    list.replaceChildren();
    if (stations.length === 0) {
      const empty = doc.createElement('p');
      empty.className = 'empty';
      empty.textContent =
        chip === 'saved' && search.value.trim() === ''
          ? 'No saved stations yet. Use the heart on a station to keep it in this browser.'
          : 'No matching stations.';
      list.append(empty);
      return;
    }
    const currentId = snapshot.station?.id ?? '';
    for (const station of stations) {
      list.append(renderRow(station, currentId));
    }
  };

  const renderRow = (station: Station, currentId: string): HTMLElement => {
    const row = doc.createElement('div');
    row.className = 'row';
    row.setAttribute('role', 'listitem');

    const main = doc.createElement('button');
    main.type = 'button';
    main.className = 'row-main';
    if (station.id === currentId && snapshot.phase === 'playing') {
      main.classList.add('is-playing');
    }
    main.append(artwork(station), labels(station));
    main.addEventListener('click', () => {
      void post({ target: 'controller', type: 'play', station });
    });

    const heart = doc.createElement('button');
    heart.type = 'button';
    heart.className = 'heart';
    const saved = isFavorite(favorites, station.id);
    heart.setAttribute('aria-pressed', String(saved));
    heart.setAttribute(
      'aria-label',
      saved ? `Remove ${station.name}` : `Save ${station.name}`
    );
    heart.textContent = saved ? '♥' : '♡';
    heart.addEventListener('click', () => {
      void post({ target: 'controller', type: 'toggle-favorite', station });
    });

    row.append(main, heart);
    return row;
  };

  const artwork = (station: Station): HTMLElement => {
    if (station.favicon) {
      const image = doc.createElement('img');
      image.className = 'favicon';
      image.alt = '';
      image.referrerPolicy = 'no-referrer';
      image.src = station.favicon;
      image.addEventListener('error', () => {
        image.replaceWith(monogram(station));
      });
      return image;
    }
    return monogram(station);
  };

  const monogram = (station: Station): HTMLElement => {
    const mark = doc.createElement('span');
    mark.className = 'monogram';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = station.name.slice(0, 1).toUpperCase();
    return mark;
  };

  const labels = (station: Station): HTMLElement => {
    const copy = doc.createElement('span');
    copy.className = 'row-copy';
    const name = doc.createElement('strong');
    name.textContent = station.name;
    const detail = doc.createElement('span');
    detail.textContent = stationSubtitle(station) || 'Internet radio';
    copy.append(name, detail);
    return copy;
  };

  const showBanner = (message: string): void => {
    if (!message) {
      banner.hidden = true;
      banner.textContent = '';
      return;
    }
    banner.hidden = false;
    banner.textContent = message;
  };

  const apply = (response: ExtensionResponse): void => {
    snapshot = response.snapshot;
    favorites = response.favorites;
    if (response.listed) {
      stations = response.stations;
    } else if (chip === 'saved' && search.value.trim() === '') {
      stations = favorites;
    }
    showBanner(response.ok ? '' : response.error);
    renderNow();
    renderList();
  };

  const post = async (message: Record<string, unknown>): Promise<void> => {
    const raw: unknown = await chrome.runtime.sendMessage(message);
    if (isResponse(raw)) {
      apply(raw);
    }
  };

  const setChip = (next: Chip): void => {
    chip = next;
    for (const button of chips) {
      button.setAttribute(
        'aria-pressed',
        String(button.dataset['chip'] === next)
      );
    }
  };

  const loadChip = async (next: Chip): Promise<void> => {
    setChip(next);
    search.value = '';
    if (next === 'saved') {
      stations = favorites;
      showBanner('');
      renderList();
      return;
    }
    list.replaceChildren(note('Loading stations…'));
    if (next === 'popular') {
      await post({ target: 'controller', type: 'top' });
      return;
    }
    await post({ target: 'controller', type: 'tag', tag: next });
  };

  const note = (text: string): HTMLElement => {
    const paragraph = doc.createElement('p');
    paragraph.className = 'empty';
    paragraph.textContent = text;
    return paragraph;
  };

  transport.addEventListener('click', () => {
    const playing =
      snapshot.phase === 'playing' || snapshot.phase === 'connecting';
    void post({ target: 'controller', type: playing ? 'stop' : 'toggle' });
  });

  favorite.addEventListener('click', () => {
    const station = snapshot.station;
    if (!station) {
      return;
    }
    void post({ target: 'controller', type: 'toggle-favorite', station });
  });

  searchForm.addEventListener('submit', event => {
    event.preventDefault();
    if (searchTimer !== null) {
      clearTimeout(searchTimer);
      searchTimer = null;
    }
    void runSearch();
  });

  search.addEventListener('input', () => {
    if (searchTimer !== null) {
      clearTimeout(searchTimer);
    }
    searchTimer = setTimeout(() => {
      void runSearch();
    }, 300);
  });

  const runSearch = async (): Promise<void> => {
    const query = search.value.trim();
    if (!query) {
      await loadChip(chip);
      return;
    }
    for (const button of chips) {
      button.setAttribute('aria-pressed', 'false');
    }
    list.replaceChildren(note('Searching…'));
    await post({ target: 'controller', type: 'search', query });
  };

  for (const button of chips) {
    button.addEventListener('click', () => {
      const next = button.dataset['chip'];
      if (
        next === 'popular' ||
        next === 'saved' ||
        next === 'rock' ||
        next === 'jazz' ||
        next === 'news' ||
        next === 'classical' ||
        next === 'electronic'
      ) {
        void loadChip(next);
      }
    });
  }

  metadata.addEventListener('click', () => {
    void chrome.permissions
      .request({ origins: ['http://*/*', 'https://*/*'] })
      .then(granted => {
        if (!granted) {
          return;
        }
        metadata.hidden = true;
        void post({ target: 'controller', type: 'metadata-enabled' });
      });
  });

  chrome.runtime.onMessage.addListener(message => {
    const push = message as ExtensionPush | undefined;
    if (!push || push.target !== 'popup' || push.type !== 'state') {
      return undefined;
    }
    apply({
      ok: true,
      error: '',
      snapshot: push.snapshot,
      favorites: push.favorites,
      stations: [],
      listed: false,
    });
    return undefined;
  });

  void chrome.permissions
    .contains({ origins: ['http://*/*', 'https://*/*'] })
    .then(granted => {
      metadata.hidden = granted;
    })
    .catch(() => undefined);

  void post({ target: 'controller', type: 'snapshot' }).then(() =>
    loadChip('popular')
  );
}

if (typeof document !== 'undefined') {
  initPopup(document);
}
