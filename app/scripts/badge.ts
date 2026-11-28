import { trackLabel, type Station } from './stations';

export type Phase = 'idle' | 'connecting' | 'playing' | 'error';

export interface PlaybackSnapshot {
  phase: Phase;
  station: Station | null;
  trackTitle: string;
  trackArtist: string;
  retryCount: number;
  statusText: string;
}

export interface BadgeView {
  text: string;
  color: string;
  title: string;
}

const PLAYING = '#1B7F3A';
const IDLE = '#5F6368';
const LOADING = '#C47B00';
const ERROR = '#C5221F';

export function badgeFor(snapshot: PlaybackSnapshot): BadgeView {
  const stationName = snapshot.station?.name ?? '';
  if (snapshot.phase === 'connecting') {
    const title = stationName
      ? `ShoutKit — Connecting to ${stationName}`
      : 'ShoutKit — Connecting';
    return { text: '...', color: LOADING, title };
  }
  if (snapshot.phase === 'error') {
    const title = stationName
      ? `ShoutKit — ${stationName} is unavailable`
      : 'ShoutKit — Stream error';
    return { text: 'ERR', color: ERROR, title };
  }
  if (snapshot.phase === 'playing') {
    const track = trackLabel(snapshot.trackTitle, snapshot.trackArtist);
    const title = track
      ? `ShoutKit — ${stationName} — ${track}`
      : `ShoutKit — ${stationName || 'Live'}`;
    return { text: 'ON', color: PLAYING, title };
  }
  return {
    text: 'OFF',
    color: IDLE,
    title: stationName ? `ShoutKit — ${stationName}` : 'ShoutKit',
  };
}
