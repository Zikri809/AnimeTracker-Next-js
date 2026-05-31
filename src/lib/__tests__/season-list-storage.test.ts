import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseWatchlistMap,
  readRouteScopedSlice,
  writeRouteScopedSlice,
  readRouteScopedSortType,
  writeRouteScopedSortType,
  readRouteScopedSortedAnime,
  writeRouteScopedSortedAnime,
} from '../season-list-storage';

describe('season-list-storage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('parseWatchlistMap', () => {
    it('returns empty Map when key is missing or null', () => {
      expect(parseWatchlistMap('non-existent')).toBeInstanceOf(Map);
      expect(parseWatchlistMap('non-existent').size).toBe(0);
    });

    it('returns empty Map for empty string, null, malformed JSON, object JSON, and non-pair arrays', () => {
      localStorage.setItem('k1', '');
      localStorage.setItem('k2', 'null');
      localStorage.setItem('k3', '{malformed');
      localStorage.setItem('k4', JSON.stringify({ a: 1 }));
      localStorage.setItem('k5', JSON.stringify([1, 2, 3])); // array of numbers, not pairs

      expect(parseWatchlistMap('k1').size).toBe(0);
      expect(parseWatchlistMap('k2').size).toBe(0);
      expect(parseWatchlistMap('k3').size).toBe(0);
      expect(parseWatchlistMap('k4').size).toBe(0);
      expect(parseWatchlistMap('k5').size).toBe(0);
    });

    it('parses valid serialized map arrays, converting keys to numeric type consistently', () => {
      const originalMap = new Map<any, any>([
        [101, { title: 'Anime 1' }],
        ['202', { title: 'Anime 2' }], // string key
      ]);
      localStorage.setItem('watchlist', JSON.stringify([...originalMap]));

      const parsed = parseWatchlistMap('watchlist');
      expect(parsed.size).toBe(2);
      expect(parsed.has(101)).toBe(true);
      expect(parsed.has(202)).toBe(true); // string key '202' converted to number 202
      expect(parsed.get(101)).toEqual({ title: 'Anime 1' });
    });
  });

  describe('route-scoped states', () => {
    const pathname = '/morethiseseason';

    it('reads and writes route-scoped slice count correctly, rejecting invalid values', () => {
      writeRouteScopedSlice(pathname, 60);
      expect(readRouteScopedSlice(pathname)).toBe(60);

      // Rejects NaN/negative/zero/unreasonably high
      sessionStorage.setItem(`season-list:${pathname}:slicearr`, JSON.stringify('NaN'));
      expect(readRouteScopedSlice(pathname)).toBeNull();

      sessionStorage.setItem(`season-list:${pathname}:slicearr`, JSON.stringify(-5));
      expect(readRouteScopedSlice(pathname)).toBeNull();

      sessionStorage.setItem(`season-list:${pathname}:slicearr`, JSON.stringify(0));
      expect(readRouteScopedSlice(pathname)).toBeNull();

      sessionStorage.setItem(`season-list:${pathname}:slicearr`, JSON.stringify(99999));
      expect(readRouteScopedSlice(pathname)).toBeNull();
    });

    it('reads and writes route-scoped sort type', () => {
      writeRouteScopedSortType(pathname, 'TopScore');
      expect(readRouteScopedSortType(pathname)).toBe('TopScore');
    });

    it('reads and writes route-scoped sorted anime lists', () => {
      const items = [{ node: { id: 1 } }, { node: { id: 2 } }];
      writeRouteScopedSortedAnime(pathname, items);
      expect(readRouteScopedSortedAnime(pathname, items)).toEqual(items);
    });

    it('rejects stale route-scoped sorted anime lists for a different route payload', () => {
      const currentItems = [{ node: { id: 1 } }, { node: { id: 2 } }];
      const staleItems = [{ node: { id: 1 } }, { node: { id: 999 } }];

      writeRouteScopedSortedAnime(pathname, staleItems);

      expect(readRouteScopedSortedAnime(pathname, currentItems)).toBeNull();
      expect(sessionStorage.getItem(`season-list:${pathname}:sorted_anime`)).toBeNull();
    });

    it('uses legacy global sorted_anime only if IDs are a subset of initialItems', () => {
      const initialItems = [{ node: { id: 1 } }, { node: { id: 2 } }, { node: { id: 3 } }];
      const subsetItems = [{ node: { id: 1 } }, { node: { id: 2 } }];
      const notSubsetItems = [{ node: { id: 1 } }, { node: { id: 4 } }];

      // Set up legacy global keys
      sessionStorage.setItem('sorted_anime', JSON.stringify(subsetItems));
      sessionStorage.setItem('sort_type', JSON.stringify('TopScore'));
      sessionStorage.setItem('slicearr', JSON.stringify(45));

      // Attempt read: subset matches initial items, so it should succeed
      const readSubset = readRouteScopedSortedAnime(pathname, initialItems);
      expect(readSubset).toEqual(subsetItems);
      // Verify legacy global keys are cleared and scoped ones are set
      expect(sessionStorage.getItem('sorted_anime')).toBeNull();
      expect(sessionStorage.getItem(`season-list:${pathname}:sorted_anime`)).toBe(JSON.stringify(subsetItems));
      expect(sessionStorage.getItem(`season-list:${pathname}:sort_type`)).toBe(JSON.stringify('TopScore'));
      expect(sessionStorage.getItem(`season-list:${pathname}:slicearr`)).toBe(JSON.stringify(45));

      // Now test with non-subset
      sessionStorage.clear();
      sessionStorage.setItem('sorted_anime', JSON.stringify(notSubsetItems));
      const readNotSubset = readRouteScopedSortedAnime(pathname, initialItems);
      expect(readNotSubset).toBeNull();
      expect(sessionStorage.getItem('sorted_anime')).toBeNull(); // should be cleared
    });
  });
});
