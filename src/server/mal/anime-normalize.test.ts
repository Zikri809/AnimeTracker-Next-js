import { describe, it, expect } from 'vitest';
import { normalizeMalAnime } from './anime-normalize';

describe('MAL Anime Normalize Helper', () => {
  it('should normalize full MAL details correctly', () => {
    const rawData = {
      id: 50346,
      title: 'Spy x Family',
      main_picture: {
        medium: 'http://med.jpg',
        large: 'http://large.jpg',
      },
      alternative_titles: {
        en: 'SPY x FAMILY',
        ja: 'スパイファミリー',
        synonyms: ['Spy Family'],
      },
      status: 'finished_airing',
      start_season: {
        year: 2022,
        season: 'spring',
      },
      num_episodes: 12,
      mean: 8.5,
      num_scoring_users: 500000,
      popularity: 120,
      genres: [
        { id: 1, name: 'Action' },
        { id: 4, name: 'Comedy' },
      ],
      my_list_status: {
        status: 'watching',
        score: 9,
        num_episodes_watched: 3,
        is_rewatching: false,
        updated_at: '2026-05-31T12:00:00Z',
      },
    };

    const trackingItem = normalizeMalAnime(rawData);
    expect(trackingItem.node.id).toBe(50346);
    expect(trackingItem.node.title).toBe('Spy x Family');
    expect(trackingItem.node.main_picture?.large).toBe('http://large.jpg');
    expect(trackingItem.node.main_picture?.medium).toBe('http://med.jpg');
    expect(trackingItem.node.alternative_titles?.en).toBe('SPY x FAMILY');
    expect(trackingItem.node.alternative_titles?.synonyms).toEqual(['Spy Family']);
    expect(trackingItem.node.status).toBe('finished_airing');
    expect(trackingItem.node.start_season).toEqual({ season: 'spring', year: 2022 });
    expect(trackingItem.node.num_episodes).toBe(12);
    expect(trackingItem.node.mean).toBe(8.5);
    expect(trackingItem.node.genres).toEqual([
      { id: 1, name: 'Action' },
      { id: 4, name: 'Comedy' },
    ]);
    expect(trackingItem.list_status).toEqual({
      status: 'watching',
      score: 9,
      num_episodes_watched: 3,
      is_rewatching: false,
      updated_at: '2026-05-31T12:00:00Z',
    });
  });

  it('should initialize local defaults when my_list_status is missing', () => {
    const rawData = {
      id: 123,
      title: 'No List Status Anime',
    };

    const trackingItem = normalizeMalAnime(rawData);
    expect(trackingItem.list_status).toEqual({
      status: null,
      score: 0,
      num_episodes_watched: 0,
      is_rewatching: false,
      updated_at: null,
    });
  });

  it('should not throw on missing fields', () => {
    const rawData = { id: 999 };
    const trackingItem = normalizeMalAnime(rawData);
    expect(trackingItem.node.id).toBe(999);
    expect(trackingItem.node.title).toBeNull();
    expect(trackingItem.node.main_picture).toBeNull();
    expect(trackingItem.node.alternative_titles).toBeNull();
    expect(trackingItem.node.status).toBeNull();
    expect(trackingItem.node.start_season).toBeNull();
    expect(trackingItem.node.num_episodes).toBeNull();
    expect(trackingItem.node.mean).toBeNull();
    expect(trackingItem.node.genres).toBeNull();
  });

  it('should normalize zero episode counts to unknown', () => {
    const trackingItem = normalizeMalAnime({ id: 100, title: 'Unknown Episodes', num_episodes: 0 });
    expect(trackingItem.node.num_episodes).toBeNull();
  });
});
