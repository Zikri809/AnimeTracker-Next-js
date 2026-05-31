import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import last_click from './lastclick_tracking';

describe('last_click tracking preselect', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('does not throw when watchlist storage is corrupted', () => {
    localStorage.setItem('Watching', 'not-json');

    expect(() => {
      last_click({ current: [] }, { scrollTo: vi.fn() }, { scrollTo: vi.fn() }, undefined, 1);
    }).not.toThrow();
  });

  it('preselects and clamps stored progress and score to available carousel snaps', () => {
    const click = vi.fn();
    const progressScrollTo = vi.fn();
    const scoreScrollTo = vi.fn();
    const item = {
      node: { id: 1, title: 'Test' },
      list_status: {
        status: 'watching',
        score: 99,
        num_episodes_watched: 99,
        is_rewatching: false,
        updated_at: null,
      },
    };

    localStorage.setItem('Watching', JSON.stringify([[1, item]]));

    last_click(
      { current: [{ click }] },
      { scrollTo: progressScrollTo, scrollSnapList: () => [0, 1, 2] },
      { scrollTo: scoreScrollTo, scrollSnapList: () => [0, 1, 2, 3] },
      undefined,
      1
    );

    expect(click).toHaveBeenCalledOnce();
    expect(progressScrollTo).toHaveBeenCalledWith(2);
    expect(scoreScrollTo).toHaveBeenCalledWith(3);
  });
});
