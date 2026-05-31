import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  addToWatchlist,
  removeFromAllWatchlists,
  getWatchlistMap,
  getAnimeWatchlistStatus,
  WATCHLIST_KEYS,
  saveWatchlistMap,
} from './watchlist-storage';
import { MalTrackingItem } from './mal-tracking-item';

describe('Watchlist Storage Helper', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  const testItem: MalTrackingItem = {
    node: {
      id: 12345,
      title: 'Test Anime',
    },
    list_status: {
      status: 'watching',
      score: 8,
      num_episodes_watched: 2,
      is_rewatching: false,
      updated_at: null,
    },
  };

  it('should handle missing or empty storage values safely', () => {
    const map = getWatchlistMap('Watching');
    expect(map).toBeInstanceOf(Map);
    expect(map.size).toBe(0);
  });

  it('should handle invalid/corrupted storage values safely without throwing', () => {
    localStorage.setItem('Watching', 'corrupted data');
    const map = getWatchlistMap('Watching');
    expect(map.size).toBe(0);
  });

  it('should handle storage getItem throwing safely', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => getWatchlistMap('Watching')).not.toThrow();
    expect(getWatchlistMap('Watching').size).toBe(0);
    getItem.mockRestore();
  });

  it('should report false when storage setItem throws', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    const map = new Map<number, MalTrackingItem>();
    map.set(12345, testItem);

    expect(saveWatchlistMap('Watching', map)).toBe(false);
    setItem.mockRestore();
  });

  it('should drop invalid, zero, negative, decimal, or NaN IDs and mismatched node IDs', () => {
    const mixedData = [
      [123, { node: { id: 123, title: 'Valid' } }],
      [0, { node: { id: 0, title: 'Zero ID' } }],
      [-5, { node: { id: -5, title: 'Negative ID' } }],
      [12.5, { node: { id: 12.5, title: 'Decimal ID' } }],
      [NaN, { node: { id: NaN, title: 'NaN ID' } }],
      [456, { node: { id: 999, title: 'Mismatched ID' } }],
      [789, null],
      [789, { node: null }],
    ];
    localStorage.setItem('Watching', JSON.stringify(mixedData));
    const map = getWatchlistMap('Watching');
    expect(map.size).toBe(1);
    expect(map.has(123)).toBe(true);
    expect(map.get(123)?.node.title).toBe('Valid');
  });

  it('should handle wrong-shape storage values (array of items) safely', () => {
    const wrongData = [
      {
        node: { id: 12345, title: 'Test Anime' },
        list_status: { status: 'watching', score: 8, num_episodes_watched: 2, is_rewatching: false, updated_at: null },
      },
    ];
    localStorage.setItem('Watching', JSON.stringify(wrongData));
    const map = getWatchlistMap('Watching');
    expect(map.size).toBe(1);
    expect(map.has(12345)).toBe(true);
    expect(map.get(12345)?.node.title).toBe('Test Anime');
  });

  it('should add item to target watchlist and remove it from all others', () => {
    // Manually add to Dropped first
    const droppedMap = new Map<number, MalTrackingItem>();
    droppedMap.set(12345, testItem);
    localStorage.setItem('Dropped', JSON.stringify([...droppedMap]));

    // Add to Watching
    addToWatchlist(testItem, 'Watching');

    expect(getWatchlistMap('Watching').has(12345)).toBe(true);
    expect(getWatchlistMap('Dropped').has(12345)).toBe(false);
  });

  it('should remove item from all lists when removeFromAllWatchlists is called', () => {
    // Add to Watching
    const watchingMap = new Map<number, MalTrackingItem>();
    watchingMap.set(12345, testItem);
    localStorage.setItem('Watching', JSON.stringify([...watchingMap]));

    removeFromAllWatchlists(12345);

    for (const key of WATCHLIST_KEYS) {
      expect(getWatchlistMap(key).has(12345)).toBe(false);
    }
  });

  it('should check status of anime correctly', () => {
    addToWatchlist(testItem, 'Completed');
    const status = getAnimeWatchlistStatus(12345);
    expect(status.key).toBe('Completed');
    expect(status.item?.node.title).toBe('Test Anime');

    const statusNotAdded = getAnimeWatchlistStatus(99999);
    expect(statusNotAdded.key).toBeNull();
    expect(statusNotAdded.item).toBeNull();
  });
});
