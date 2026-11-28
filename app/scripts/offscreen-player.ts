/// <reference types="chrome-types" />

import type { Player, PlayerListener } from './controller';

interface PendingPlay {
  request: number;
  resolve: () => void;
  reject: (error: Error) => void;
}

/**
 * Chrome MV3 service workers have no DOM, so audio lives in an offscreen
 * document created with the AUDIO_PLAYBACK reason. That document outlives
 * the toolbar popup.
 */
export class OffscreenPlayer implements Player {
  #listener: PlayerListener | null = null;
  #pending: PendingPlay | null = null;
  #request = 0;
  #creating: Promise<void> | null = null;
  #tail: Promise<unknown> = Promise.resolve();

  constructor() {
    chrome.runtime.onMessage.addListener(message => {
      if (!message || message.target !== 'offscreen-player') {
        return undefined;
      }
      const request =
        typeof message.request === 'number' ? message.request : -1;
      if (message.event === 'playing' || message.event === 'error') {
        const pending = this.#pending;
        if (!pending || pending.request !== request) {
          return undefined;
        }
        this.#pending = null;
        if (message.event === 'playing') {
          pending.resolve();
        } else {
          const detail =
            typeof message.detail === 'string'
              ? message.detail
              : 'Playback failed';
          pending.reject(new Error(detail));
        }
        return undefined;
      }
      if (message.event === 'ended') {
        const detail =
          typeof message.detail === 'string' ? message.detail : 'ended';
        this.#listener?.unexpectedStop(detail);
      } else if (message.event === 'metadata') {
        this.#listener?.metadata({
          title: typeof message.title === 'string' ? message.title : '',
          artist: typeof message.artist === 'string' ? message.artist : '',
        });
      }
      return undefined;
    });
  }

  setListener(listener: PlayerListener | null): void {
    this.#listener = listener;
  }

  play(url: string): Promise<void> {
    return this.#enqueue(() => this.#play(url));
  }

  stop(): Promise<void> {
    return this.#enqueue(() => this.#stop());
  }

  refreshMetadata(): void {
    void chrome.runtime
      .sendMessage({ target: 'offscreen', type: 'refresh-metadata' })
      .catch(() => undefined);
  }

  async #play(url: string): Promise<void> {
    const request = ++this.#request;
    await this.#ensure();
    const result = new Promise<void>((resolve, reject) => {
      this.#pending = { request, resolve, reject };
    });
    const timeout = setTimeout(() => {
      this.#rejectPending(request, new Error('Timed out starting playback'));
    }, 20_000);
    try {
      try {
        await chrome.runtime.sendMessage({
          target: 'offscreen',
          type: 'play',
          url,
          request,
        });
      } catch (error) {
        await new Promise(resolve => {
          setTimeout(resolve, 50);
        });
        try {
          await chrome.runtime.sendMessage({
            target: 'offscreen',
            type: 'play',
            url,
            request,
          });
        } catch {
          this.#rejectPending(
            request,
            error instanceof Error ? error : new Error('Playback failed')
          );
        }
      }
      await result;
    } finally {
      clearTimeout(timeout);
    }
  }

  #rejectPending(request: number, error: Error): void {
    if (this.#pending?.request !== request) {
      return;
    }
    const pending = this.#pending;
    this.#pending = null;
    pending.reject(error);
  }

  async #stop(): Promise<void> {
    const pending = this.#pending;
    this.#pending = null;
    this.#request += 1;
    pending?.reject(new Error('stopped'));
    await chrome.runtime
      .sendMessage({ target: 'offscreen', type: 'stop' })
      .catch(() => undefined);
    if (chrome.offscreen) {
      await chrome.offscreen.closeDocument().catch(() => undefined);
    }
  }

  async #ensure(): Promise<void> {
    if (!chrome.offscreen) {
      throw new Error('Offscreen playback is unavailable.');
    }
    if (
      typeof chrome.offscreen.hasDocument === 'function' &&
      (await chrome.offscreen.hasDocument())
    ) {
      return;
    }
    if (this.#creating) {
      await this.#creating;
      return;
    }
    this.#creating = chrome.offscreen
      .createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification:
          'Play the selected internet radio station after the toolbar popup closes.',
      })
      .then(() => undefined)
      .catch(async error => {
        if (
          typeof chrome.offscreen.hasDocument === 'function' &&
          (await chrome.offscreen.hasDocument())
        ) {
          return;
        }
        throw error;
      })
      .finally(() => {
        this.#creating = null;
      });
    await this.#creating;
  }

  #enqueue<T>(task: () => Promise<T>): Promise<T> {
    const run = this.#tail.then(task, task);
    this.#tail = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }
}
