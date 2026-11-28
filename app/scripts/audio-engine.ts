import { sniffIcyTitle, type IcyTrack } from './icy';
import type { Player, PlayerListener } from './controller';

const FIRST_SNIFF_MS = 1500;
const SNIFF_INTERVAL_MS = 45_000;
const MAX_SNIFF_FAILURES = 2;

/**
 * Plays a stream with the document's audio element and reads ICY titles on a
 * short-lived side request. Used in the Chrome offscreen document and, where
 * the background context still has a DOM, directly in that background page.
 */
export class DomAudioPlayer implements Player {
  #audio: HTMLAudioElement | null = null;
  #listener: PlayerListener | null = null;
  #token = 0;
  #intentional = false;
  #url = '';
  #timer: ReturnType<typeof setTimeout> | null = null;
  #sniffAbort: AbortController | null = null;
  #sniffFailures = 0;
  #tail: Promise<unknown> = Promise.resolve();

  setListener(listener: PlayerListener | null): void {
    this.#listener = listener;
  }

  play(url: string): Promise<void> {
    return this.#enqueue(() => this.#play(url));
  }

  stop(): Promise<void> {
    return this.#enqueue(() => {
      this.#halt();
    });
  }

  refreshMetadata(): void {
    this.#sniffFailures = 0;
    const url = this.#url;
    const token = this.#token;
    if (!url) {
      return;
    }
    void this.#sniffOnce(url, token);
  }

  async #play(url: string): Promise<void> {
    const token = ++this.#token;
    this.#intentional = false;
    this.#url = url;
    this.#sniffFailures = 0;
    this.#cancelSniff();
    const audio = this.#element();
    audio.src = url;
    try {
      await audio.play();
    } catch (error) {
      if (token !== this.#token) {
        return;
      }
      this.#url = '';
      throw error instanceof Error ? error : new Error('Playback failed');
    }
    if (token !== this.#token) {
      this.#halt();
      return;
    }
    this.#armSniff(url, token, FIRST_SNIFF_MS);
  }

  #halt(): void {
    this.#token += 1;
    this.#intentional = true;
    this.#url = '';
    this.#cancelSniff();
    const audio = this.#audio;
    if (!audio) {
      return;
    }
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  }

  #element(): HTMLAudioElement {
    if (this.#audio) {
      return this.#audio;
    }
    if (typeof Audio !== 'function') {
      throw new Error('Audio playback is unavailable in this context.');
    }
    const audio = new Audio();
    audio.preload = 'none';
    audio.setAttribute('data-shoutkit-player', 'true');
    if (typeof document !== 'undefined' && document.body) {
      document.body.append(audio);
    }
    audio.addEventListener('error', () => {
      const token = this.#token;
      queueMicrotask(() => {
        if (token !== this.#token || this.#intentional) {
          return;
        }
        this.#listener?.unexpectedStop('error');
      });
    });
    audio.addEventListener('ended', () => {
      if (this.#intentional || !this.#url) {
        return;
      }
      this.#listener?.unexpectedStop('ended');
    });
    this.#audio = audio;
    return audio;
  }

  #armSniff(url: string, token: number, delay: number): void {
    this.#cancelSniff();
    this.#timer = setTimeout(() => {
      void this.#sniffOnce(url, token).finally(() => {
        if (
          token !== this.#token ||
          this.#sniffFailures >= MAX_SNIFF_FAILURES
        ) {
          return;
        }
        this.#armSniff(url, token, SNIFF_INTERVAL_MS);
      });
    }, delay);
  }

  async #sniffOnce(url: string, token: number): Promise<void> {
    this.#sniffAbort?.abort();
    const abort = new AbortController();
    this.#sniffAbort = abort;
    try {
      const track = await sniffIcyTitle(
        url,
        fetch.bind(globalThis),
        abort.signal
      );
      if (token !== this.#token || !track) {
        return;
      }
      this.#sniffFailures = 0;
      const payload: IcyTrack = { title: track.title, artist: track.artist };
      this.#listener?.metadata(payload);
    } catch {
      if (abort.signal.aborted || token !== this.#token) {
        return;
      }
      this.#sniffFailures += 1;
    }
  }

  #cancelSniff(): void {
    if (this.#timer !== null) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }
    this.#sniffAbort?.abort();
    this.#sniffAbort = null;
  }

  #enqueue<T>(task: () => Promise<T> | T): Promise<T> {
    const run = this.#tail.then(task, task);
    this.#tail = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }
}
