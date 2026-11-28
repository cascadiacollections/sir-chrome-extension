import type { PlaybackSnapshot } from './badge';
import type { Station } from './stations';

export interface ExtensionResponse {
  ok: boolean;
  error: string;
  snapshot: PlaybackSnapshot;
  favorites: Station[];
  stations: Station[];
  listed: boolean;
}

export interface ExtensionPush {
  target: 'popup';
  type: 'state';
  snapshot: PlaybackSnapshot;
  favorites: Station[];
}
