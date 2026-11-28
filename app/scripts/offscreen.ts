/// <reference types="chrome-types" />

import { DomAudioPlayer } from './audio-engine';

function detailOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Playback failed';
}

function startOffscreen(): void {
  const engine = new DomAudioPlayer();
  engine.setListener({
    unexpectedStop: reason => {
      void chrome.runtime
        .sendMessage({
          target: 'offscreen-player',
          event: 'ended',
          detail: reason,
        })
        .catch(() => undefined);
    },
    metadata: track => {
      void chrome.runtime
        .sendMessage({
          target: 'offscreen-player',
          event: 'metadata',
          title: track.title,
          artist: track.artist,
        })
        .catch(() => undefined);
    },
  });

  chrome.runtime.onMessage.addListener(message => {
    if (!message || message.target !== 'offscreen') {
      return undefined;
    }
    if (message.type === 'play' && typeof message.url === 'string') {
      const request = message.request;
      void engine.play(message.url).then(
        () => {
          void chrome.runtime
            .sendMessage({
              target: 'offscreen-player',
              event: 'playing',
              request,
            })
            .catch(() => undefined);
        },
        (error: unknown) => {
          void chrome.runtime
            .sendMessage({
              target: 'offscreen-player',
              event: 'error',
              request,
              detail: detailOf(error),
            })
            .catch(() => undefined);
        }
      );
    } else if (message.type === 'stop') {
      void engine.stop();
    } else if (message.type === 'refresh-metadata') {
      engine.refreshMetadata();
    }
    return undefined;
  });
}

startOffscreen();
