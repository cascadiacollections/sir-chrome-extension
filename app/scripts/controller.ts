import type { PlaybackSnapshot } from './badge';
import { sanitizeStationList, toggleFavorite } from './favorites';
import { canRetryStream, streamRetryDelayMs } from './retry';
import type { RadioBrowserClient } from './radio-browser';
import { stationFromUnknown, type Station } from './stations';
import type { IcyTrack } from './icy';

export interface PlayerListener {
  unexpectedStop: (reason: string) => void;
  metadata: (track: IcyTrack) => void;
}

/** Audio output. Chrome uses an offscreen document; Firefox can use this directly. */
export interface Player {
  play: (url: string) => Promise<void>;
  stop: () => Promise<void>;
  setListener: (listener: PlayerListener | null) => void;
  refreshMetadata: () => void;
}

export interface LibrarySnapshot {
  favorites: Station[];
  lastStation: Station | null;
}

export interface LibraryStore {
  load: () => Promise<LibrarySnapshot>;
  save: (library: LibrarySnapshot) => Promise<void>;
}

export interface ShoutKitControllerDeps {
  directory: Pick<
    RadioBrowserClient,
    'search' | 'topStations' | 'stationsByTag' | 'resolveStream'
  >;
  player: Player;
  store: LibraryStore;
  sleep?: (ms: number) => Promise<void>;
  onChange?: (snapshot: PlaybackSnapshot) => void;
}

const LIST_LIMIT = 25;

function emptySnapshot(): PlaybackSnapshot {
  return {
    phase: 'idle',
    station: null,
    trackTitle: '',
    trackArtist: '',
    retryCount: 0,
    statusText: 'Pick a station',
  };
}

/**
 * Playback, favorites, and directory calls. Chrome-specific I/O stays outside
 * so this can be tested with fakes.
 */
export class ShoutKitController {
  readonly #directory: ShoutKitControllerDeps['directory'];
  readonly #player: Player;
  readonly #store: LibraryStore;
  readonly #sleep: (ms: number) => Promise<void>;
  readonly #onChange: ((snapshot: PlaybackSnapshot) => void) | null;
  #snapshot: PlaybackSnapshot = emptySnapshot();
  #favorites: Station[] = [];
  #generation = 0;
  #resolvedUrl = '';

  constructor(deps: ShoutKitControllerDeps) {
    this.#directory = deps.directory;
    this.#player = deps.player;
    this.#store = deps.store;
    const defaultSleep = (ms: number): Promise<void> =>
      new Promise(resolve => {
        setTimeout(resolve, ms);
      });
    this.#sleep = deps.sleep ?? defaultSleep;
    this.#onChange = deps.onChange ?? null;
    this.#player.setListener({
      unexpectedStop: reason => {
        if (this.#snapshot.phase !== 'playing') {
          return;
        }
        void this.#recover(this.#generation, reason);
      },
      metadata: track => {
        if (this.#snapshot.phase !== 'playing') {
          return;
        }
        this.#set({
          trackTitle: track.title,
          trackArtist: track.artist,
          statusText: 'Live',
        });
      },
    });
  }

  async start(): Promise<void> {
    const library = await this.#store.load();
    this.#favorites = sanitizeStationList(library.favorites);
    const last = stationFromUnknown(library.lastStation);
    this.#set({
      phase: 'idle',
      station: last,
      trackTitle: '',
      trackArtist: '',
      retryCount: 0,
      statusText: last ? 'Stopped' : 'Pick a station',
    });
  }

  snapshot(): PlaybackSnapshot {
    return {
      ...this.#snapshot,
      station: this.#snapshot.station ? { ...this.#snapshot.station } : null,
    };
  }

  favorites(): Station[] {
    return this.#favorites.map(station => ({ ...station }));
  }

  async search(query: string): Promise<Station[]> {
    return this.#directory.search(query.trim().slice(0, 80), LIST_LIMIT);
  }

  async topStations(): Promise<Station[]> {
    return this.#directory.topStations(LIST_LIMIT);
  }

  async stationsByTag(tag: string): Promise<Station[]> {
    return this.#directory.stationsByTag(tag, LIST_LIMIT);
  }

  async play(station: Station): Promise<void> {
    const safe = stationFromUnknown(station);
    if (!safe) {
      this.#set({
        phase: 'error',
        statusText: 'That station has no playable stream.',
      });
      return;
    }
    this.#generation += 1;
    const generation = this.#generation;
    this.#resolvedUrl = '';
    this.#set({
      phase: 'connecting',
      station: safe,
      trackTitle: '',
      trackArtist: '',
      retryCount: 0,
      statusText: 'Connecting…',
    });
    await this.#attempt(safe, generation, true);
  }

  async stop(): Promise<void> {
    this.#generation += 1;
    this.#resolvedUrl = '';
    await this.#player.stop();
    this.#set({
      phase: 'idle',
      trackTitle: '',
      trackArtist: '',
      retryCount: 0,
      statusText: this.#snapshot.station ? 'Stopped' : 'Pick a station',
    });
  }

  async toggle(): Promise<void> {
    if (
      this.#snapshot.phase === 'playing' ||
      this.#snapshot.phase === 'connecting'
    ) {
      await this.stop();
      return;
    }
    const station = this.#snapshot.station;
    if (!station) {
      return;
    }
    await this.play(station);
  }

  async toggleFavorite(station: Station): Promise<Station[]> {
    const safe = stationFromUnknown(station);
    if (!safe) {
      return this.favorites();
    }
    this.#favorites = toggleFavorite(this.#favorites, safe);
    await this.#persist();
    this.#onChange?.(this.snapshot());
    return this.favorites();
  }

  refreshMetadata(): void {
    this.#player.refreshMetadata();
  }

  async #attempt(
    station: Station,
    generation: number,
    reportClick: boolean
  ): Promise<void> {
    let resolved = station;
    if (reportClick) {
      try {
        resolved = await this.#directory.resolveStream(station);
      } catch {
        resolved = station;
      }
      if (generation !== this.#generation) {
        return;
      }
      this.#resolvedUrl = resolved.streamUrl;
      this.#set({ station: resolved });
    } else if (this.#resolvedUrl) {
      resolved = { ...station, streamUrl: this.#resolvedUrl };
    }
    try {
      await this.#player.play(resolved.streamUrl);
    } catch (error) {
      if (generation !== this.#generation) {
        return;
      }
      const message =
        error instanceof Error ? error.message : 'playback failed';
      await this.#recover(generation, message);
      return;
    }
    if (generation !== this.#generation) {
      return;
    }
    this.#set({
      phase: 'playing',
      station: resolved,
      retryCount: 0,
      statusText: 'Live',
    });
    await this.#persist();
  }

  async #recover(generation: number, _reason: string): Promise<void> {
    if (generation !== this.#generation) {
      return;
    }
    const station = this.#snapshot.station;
    if (!station) {
      this.#set({ phase: 'error', statusText: 'This station is unavailable.' });
      return;
    }
    if (!canRetryStream(this.#snapshot.retryCount)) {
      await this.#player.stop().catch(() => undefined);
      this.#set({
        phase: 'error',
        statusText: 'This station is unavailable.',
      });
      return;
    }
    const retryIndex = this.#snapshot.retryCount;
    const nextRetry = retryIndex + 1;
    this.#set({
      phase: 'connecting',
      retryCount: nextRetry,
      trackTitle: '',
      trackArtist: '',
      statusText: `Reconnecting (${nextRetry}/3)…`,
    });
    await this.#sleep(streamRetryDelayMs(retryIndex));
    if (generation !== this.#generation) {
      return;
    }
    await this.#attempt(station, generation, false);
  }

  async #persist(): Promise<void> {
    await this.#store.save({
      favorites: this.#favorites,
      lastStation: this.#snapshot.station,
    });
  }

  #set(partial: Partial<PlaybackSnapshot>): void {
    this.#snapshot = { ...this.#snapshot, ...partial };
    this.#onChange?.(this.snapshot());
  }
}
