import { MalTrackingItem } from './mal-tracking-item';

export const WATCHLIST_KEYS = ['Watching', 'Completed', 'PlanToWatch', 'OnHold', 'Dropped'] as const;
export type WatchlistKey = typeof WATCHLIST_KEYS[number];

export const MYLIST_TABS = [
  { label: "Plan To Watch", storageKey: "PlanToWatch", hrefSegment: "PlanToWatch" },
  { label: "Completed", storageKey: "Completed", hrefSegment: "Completed" },
  { label: "Watching", storageKey: "Watching", hrefSegment: "Watching" },
  { label: "On Hold", storageKey: "OnHold", hrefSegment: "OnHold" },
  { label: "Dropped", storageKey: "Dropped", hrefSegment: "Dropped" },
] as const;

export function normalizeWatchlistEntries(entries: unknown): Map<number, MalTrackingItem> | null {
  if (!Array.isArray(entries)) return null;

  const map = new Map<number, MalTrackingItem>();
  for (const pair of entries) {
    if (Array.isArray(pair) && pair.length === 2) {
      const id = pair[0];
      const item = pair[1];
      if (typeof id === 'number' && Number.isInteger(id) && id > 0) {
        if (item && item.node && typeof item.node.id === 'number' && item.node.id === id) {
          map.set(id, item);
        }
      }
    } else if (pair && typeof pair === 'object' && 'node' in pair) {
      const item = pair as MalTrackingItem;
      const id = item.node?.id;
      if (typeof id === 'number' && Number.isInteger(id) && id > 0) {
        map.set(id, item);
      }
    }
  }

  return map;
}

export function getWatchlistMap(key: WatchlistKey): Map<number, MalTrackingItem> {
  if (typeof window === 'undefined') return new Map();
  try {
    const data = localStorage.getItem(key);
    if (!data) return new Map();
    const parsed = JSON.parse(data);
    return normalizeWatchlistEntries(parsed) ?? new Map();
  } catch {
    return new Map();
  }
}

export function serializeWatchlistMap(map: Map<number, MalTrackingItem>): string {
  return JSON.stringify([...map]);
}

export function saveWatchlistMap(key: WatchlistKey, map: Map<number, MalTrackingItem>): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, serializeWatchlistMap(map));
    return true;
  } catch (error) {
    console.error(`Failed to save watchlist ${key}:`, error);
    return false;
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
