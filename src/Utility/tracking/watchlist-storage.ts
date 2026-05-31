import { MalTrackingItem } from './mal-tracking-item';

export const WATCHLIST_KEYS = ['Watching', 'Completed', 'PlanToWatch', 'OnHold', 'Dropped'] as const;
export type WatchlistKey = typeof WATCHLIST_KEYS[number];

export function getWatchlistMap(key: WatchlistKey): Map<number, MalTrackingItem> {
  if (typeof window === 'undefined') return new Map();
  try {
    const data = localStorage.getItem(key);
    if (!data) return new Map();
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      const map = new Map<number, MalTrackingItem>();
      for (const pair of parsed) {
        if (Array.isArray(pair) && pair.length === 2 && typeof pair[0] === 'number') {
          map.set(pair[0], pair[1]);
        } else if (pair && typeof pair.node?.id === 'number') {
          map.set(pair.node.id, pair);
        }
      }
      return map;
    }
    return new Map();
  } catch {
    return new Map();
  }
}

export function saveWatchlistMap(key: WatchlistKey, map: Map<number, MalTrackingItem>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify([...map]));
  } catch (error) {
    console.error(`Failed to save watchlist ${key}:`, error);
  }
}

export function addToWatchlist(item: MalTrackingItem, targetKey: WatchlistKey) {
  const animeId = item.node.id;

  const targetMap = getWatchlistMap(targetKey);
  targetMap.set(animeId, item);
  saveWatchlistMap(targetKey, targetMap);

  for (const key of WATCHLIST_KEYS) {
    if (key !== targetKey) {
      const map = getWatchlistMap(key);
      if (map.has(animeId)) {
        map.delete(animeId);
        saveWatchlistMap(key, map);
      }
    }
  }
}

export function removeFromAllWatchlists(animeId: number) {
  for (const key of WATCHLIST_KEYS) {
    const map = getWatchlistMap(key);
    if (map.has(animeId)) {
      map.delete(animeId);
      saveWatchlistMap(key, map);
    }
  }
}

export function getAnimeWatchlistStatus(animeId: number): { key: WatchlistKey | null; item: MalTrackingItem | null } {
  for (const key of WATCHLIST_KEYS) {
    const map = getWatchlistMap(key);
    if (map.has(animeId)) {
      return { key, item: map.get(animeId) || null };
    }
  }
  return { key: null, item: null };
}
