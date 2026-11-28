/// <reference types="chrome-types" />

import { DomAudioPlayer } from './audio-engine';
import { badgeFor, type PlaybackSnapshot } from './badge';
import { ShoutKitController, type Player } from './controller';
import { DIRECTORY_UNAVAILABLE, RadioBrowserClient } from './radio-browser';
import { OffscreenPlayer } from './offscreen-player';
import type { ExtensionPush, ExtensionResponse } from './protocol';
import { sanitizeStationList } from './favorites';
import { stationFromUnknown, type Station } from './stations';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function createPlayer(): Player {
  if (typeof Audio === 'function') {
    return new DomAudioPlayer();
  }
  return new OffscreenPlayer();
}

function chromeLibrary(): {
  load: () => Promise<{ favorites: Station[]; lastStation: Station | null }>;
  save: (library: {
    favorites: Station[];
    lastStation: Station | null;
  }) => Promise<void>;
} {
  return {
    async load(): Promise<{
      favorites: Station[];
      lastStation: Station | null;
    }> {
      const stored = (await chrome.storage.local.get([
        'favorites',
        'lastStation',
      ])) as Record<string, unknown>;
      return {
        favorites: sanitizeStationList(stored['favorites']),
        lastStation: stationFromUnknown(stored['lastStation']),
      };
    },
    async save(library: {
      favorites: Station[];
      lastStation: Station | null;
    }): Promise<void> {
      await chrome.storage.local.set({
        favorites: library.favorites,
        lastStation: library.lastStation,
      });
    },
  };
}

function applyBadge(snapshot: PlaybackSnapshot): void {
  const badge = badgeFor(snapshot);
  void chrome.action.setBadgeText({ text: badge.text });
  void chrome.action.setBadgeBackgroundColor({ color: badge.color });
  void chrome.action.setTitle({ title: badge.title });
}

function responseFrom(
  snapshot: PlaybackSnapshot,
  favorites: Station[],
  stations: Station[] = [],
  listed = false,
  error = ''
): ExtensionResponse {
  return {
    ok: error === '',
    error,
    snapshot,
    favorites,
    stations,
    listed,
  };
}

function startBackground(): void {
  const controller = new ShoutKitController({
    directory: new RadioBrowserClient(),
    player: createPlayer(),
    store: chromeLibrary(),
    onChange: (snapshot): void => {
      applyBadge(snapshot);
      const push: ExtensionPush = {
        target: 'popup',
        type: 'state',
        snapshot,
        favorites: controller.favorites(),
      };
      void chrome.runtime.sendMessage(push).catch(() => undefined);
    },
  });

  const reply = (
    stations: Station[] = [],
    listed = false,
    error = ''
  ): ExtensionResponse =>
    responseFrom(
      controller.snapshot(),
      controller.favorites(),
      stations,
      listed,
      error
    );

  const dispatch = async (
    message: Record<string, unknown>
  ): Promise<ExtensionResponse> => {
    const type = message['type'];
    try {
      if (type === 'snapshot') {
        return reply();
      }
      if (type === 'search') {
        const query =
          typeof message['query'] === 'string' ? message['query'] : '';
        const stations = query.trim()
          ? await controller.search(query)
          : await controller.topStations();
        return reply(stations, true);
      }
      if (type === 'top') {
        return reply(await controller.topStations(), true);
      }
      if (type === 'tag') {
        const tag = typeof message['tag'] === 'string' ? message['tag'] : '';
        return reply(await controller.stationsByTag(tag), true);
      }
      if (type === 'play') {
        const station = stationFromUnknown(message['station']);
        if (!station) {
          return reply([], false, 'That station has no playable stream.');
        }
        await controller.play(station);
        return reply();
      }
      if (type === 'stop') {
        await controller.stop();
        return reply();
      }
      if (type === 'toggle') {
        await controller.toggle();
        return reply();
      }
      if (type === 'toggle-favorite') {
        const station = stationFromUnknown(message['station']);
        if (station) {
          await controller.toggleFavorite(station);
        }
        return reply();
      }
      if (type === 'metadata-enabled') {
        controller.refreshMetadata();
        return reply();
      }
      return reply([], false, 'Unknown request.');
    } catch (error) {
      // Kept: a failed directory call is otherwise invisible in the service worker.
      // eslint-disable-next-line no-console
      console.error('ShoutKit request failed', error);
      return reply([], false, DIRECTORY_UNAVAILABLE);
    }
  };

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!isRecord(message) || message['target'] !== 'controller') {
      return undefined;
    }
    void dispatch(message)
      .then(sendResponse)
      .catch(() => {
        sendResponse(reply([], false, DIRECTORY_UNAVAILABLE));
      });
    return true;
  });

  chrome.commands.onCommand.addListener(command => {
    if (command !== 'toggle-playback') {
      return;
    }
    void controller.toggle().then(() => {
      if (!controller.snapshot().station && chrome.action.openPopup) {
        void chrome.action.openPopup().catch(() => undefined);
      }
    });
  });

  void controller.start().catch(() => {
    applyBadge(controller.snapshot());
  });
}

startBackground();
