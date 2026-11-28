import { stationFromUnknown, type Station } from './stations';

export const MAX_FAVORITES = 100;

export function sanitizeStationList(value: unknown): Station[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const stations: Station[] = [];
  for (const entry of value) {
    const station = stationFromUnknown(entry);
    if (!station) {
      continue;
    }
    if (stations.some(item => item.id === station.id)) {
      continue;
    }
    stations.push(station);
    if (stations.length >= MAX_FAVORITES) {
      break;
    }
  }
  return stations;
}

export function isFavorite(favorites: readonly Station[], id: string): boolean {
  return favorites.some(item => item.id === id);
}

/** Saved stations stay at the front. Saving an existing one removes it. */
export function toggleFavorite(
  favorites: readonly Station[],
  station: Station
): Station[] {
  if (isFavorite(favorites, station.id)) {
    return favorites.filter(item => item.id !== station.id);
  }
  return [station, ...favorites.filter(item => item.id !== station.id)].slice(
    0,
    MAX_FAVORITES
  );
}
