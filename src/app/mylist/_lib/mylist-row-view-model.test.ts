import { describe, it, expect } from 'vitest';
import { normalizeRowItem, getTopOrWorstRated } from './mylist-row-view-model';

describe('mylist-row-view-model helpers', () => {
  describe('normalizeRowItem', () => {
    it('should format status and season correctly', () => {
      const mockItem = {
        node: {
          id: 1,
          title: 'Title',
          status: 'finished_airing',
          start_season: {
            season: 'spring',
            year: 2026
          }
        },
        list_status: {
          num_episodes_watched: 12
        }
      };
      const res = normalizeRowItem(mockItem);
      expect(res.title).toBe('Title');
      expect(res.status).toBe('Finished Airing');
      expect(res.season).toBe('spring 2026');
      expect(res.userProgress).toBe(12);
    });

    it('should fall back to alternative English title and legacy season', () => {
      const mockItem = {
        node: {
          id: 2,
          title: 'Original Title',
          alternative_titles: {
            en: 'English Title'
          },
          status: 'currently_airing',
          season: 'summer',
          year: 2025
        },
        userprogress: 5
      };
      const res = normalizeRowItem(mockItem);
      expect(res.title).toBe('English Title');
      expect(res.status).toBe('Currently Airing');
      expect(res.season).toBe('summer 2025');
      expect(res.userProgress).toBe(5);
    });

    it('should fall back to Anime #id for missing titles and provide fallback status', () => {
      const mockItem = {
        node: {
          id: 99
        }
      };
      const res = normalizeRowItem(mockItem);
      expect(res.title).toBe('Anime #99');
      expect(res.status).toBe('');
      expect(res.season).toBe(' ');
      expect(res.userProgress).toBe(0);
    });
  });

  describe('getTopOrWorstRated', () => {
    const items = [
      { node: { id: 1, mean: 8.5 }, list_status: { score: 9 } },
      { node: { id: 2, mean: 9.0 }, list_status: { score: 9 } },
      { node: { id: 3, mean: 7.0 }, list_status: { score: 8 } },
      { node: { id: 4, mean: 8.0 }, list_status: { score: 0 } }, // unrated
      { node: { id: 5 }, list_status: {} }, // missing score
      null, // corrupted
      { node: null } // corrupted
    ];

    it('should sort top rated with deterministic tie breaking', () => {
      const top = getTopOrWorstRated(items, true);
      expect(top[0].node.id).toBe(2);
      expect(top[1].node.id).toBe(1);
      expect(top[2].node.id).toBe(3);
      expect(top[3].node.id).toBe(4);
      expect(top[4].node.id).toBe(5);
    });

    it('should sort worst rated with deterministic tie breaking', () => {
      const worst = getTopOrWorstRated(items, false);
      expect(worst[0].node.id).toBe(5);
      expect(worst[1].node.id).toBe(4);
      expect(worst[2].node.id).toBe(3);
      expect(worst[3].node.id).toBe(1);
      expect(worst[4].node.id).toBe(2);
    });

    it('should sort by updated_at descending when scores are tied', () => {
      const tiedItems = [
        { node: { id: 1, mean: 9.0 }, list_status: { score: 10, updated_at: '2026-05-31T10:00:00Z' } },
        { node: { id: 2, mean: 8.5 }, list_status: { score: 10, updated_at: '2026-05-31T12:00:00Z' } },
        { node: { id: 3, mean: 9.5 }, list_status: { score: 10, updated_at: '2026-05-31T11:00:00Z' } },
      ];
      
      const top = getTopOrWorstRated(tiedItems, true);
      // Expected order (latest first): id 2, id 3, id 1
      expect(top[0].node.id).toBe(2);
      expect(top[1].node.id).toBe(3);
      expect(top[2].node.id).toBe(1);

      const worst = getTopOrWorstRated(tiedItems, false);
      // Expected order for worst when scores are tied: still latest first (id 2, id 3, id 1)
      expect(worst[0].node.id).toBe(2);
      expect(worst[1].node.id).toBe(3);
      expect(worst[2].node.id).toBe(1);
    });
  });
});
