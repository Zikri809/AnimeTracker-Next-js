import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { invalidateSyncSession, startWatchlistSync } from './mylist-worker-sync';

type WorkerInstance = {
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  onmessageerror: ((event: MessageEvent) => void) | null;
  postMessage: ReturnType<typeof vi.fn>;
  terminate: ReturnType<typeof vi.fn>;
};

const instances: WorkerInstance[] = [];

class WorkerMock implements WorkerInstance {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();

  constructor() {
    instances.push(this);
  }
}

function item(id: number, title = `Anime ${id}`) {
  return {
    node: { id, title },
    list_status: {
      status: 'watching',
      score: 0,
      num_episodes_watched: 0,
      is_rewatching: false,
      updated_at: null,
    },
  };
}

function successPayload(overrides: Partial<Record<string, 'success' | 'failed'>> = {}) {
  return {
    collectionarr: [
      [[1, item(1)]],
      [[2, item(2)]],
      [[3, item(3)]],
      [[4, item(4)]],
      [[5, item(5)]],
    ],
    categoryResults: {
      Watching: 'success',
      Completed: 'success',
      OnHold: 'success',
      Dropped: 'success',
      PlanToWatch: 'success',
      ...overrides,
    },
    errors: [],
  };
}

describe('mylist worker sync', () => {
  beforeEach(() => {
    instances.length = 0;
    localStorage.clear();
    vi.useRealTimers();
    vi.stubGlobal('Worker', WorkerMock);
    invalidateSyncSession();
  });

  afterEach(() => {
    invalidateSyncSession();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
    vi.useRealTimers();
  });

  it('writes successful categories and preserves failed categories', () => {
    localStorage.setItem('Watching', JSON.stringify([[9, item(9, 'Existing')]]));
    const onComplete = vi.fn();

    startWatchlistSync(onComplete);
    instances[0].onmessage?.({
      data: successPayload({ Watching: 'failed' }),
    } as MessageEvent);

    expect(JSON.parse(localStorage.getItem('Watching') || '[]')).toEqual([[9, item(9, 'Existing')]]);
    expect(JSON.parse(localStorage.getItem('Completed') || '[]')).toEqual([[2, item(2)]]);
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('rejects a successful category with malformed payload and writes nothing', () => {
    localStorage.setItem('Completed', JSON.stringify([[8, item(8, 'Existing')]]));
    const onComplete = vi.fn();
    const onError = vi.fn();

    startWatchlistSync(onComplete, onError);
    const payload = successPayload();
    payload.collectionarr[1] = { malformed: true } as any;
    instances[0].onmessage?.({ data: payload } as MessageEvent);

    expect(onComplete).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem('Completed') || '[]')).toEqual([[8, item(8, 'Existing')]]);
    expect(localStorage.getItem('Watching')).toBeNull();
  });

  it('rolls back earlier writes if a later localStorage write throws', () => {
    localStorage.setItem('Watching', JSON.stringify([[9, item(9, 'Existing')]]));
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === 'Completed') {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      }
      return originalSetItem.call(this, key, value);
    });

    const onComplete = vi.fn();
    const onError = vi.fn();
    startWatchlistSync(onComplete, onError);
    instances[0].onmessage?.({ data: successPayload() } as MessageEvent);

    expect(onComplete).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem('Watching') || '[]')).toEqual([[9, item(9, 'Existing')]]);
  });

  it('ignores stale messages after terminate', () => {
    const onComplete = vi.fn();
    const sync = startWatchlistSync(onComplete);
    sync?.terminate();

    instances[0].onmessage?.({ data: successPayload() } as MessageEvent);

    expect(onComplete).not.toHaveBeenCalled();
    expect(localStorage.getItem('Watching')).toBeNull();
  });

  it('times out when the worker never responds', () => {
    vi.useFakeTimers();
    const onError = vi.fn();
    startWatchlistSync(undefined, onError);

    vi.advanceTimersByTime(30000);

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(instances[0].terminate).toHaveBeenCalled();
  });

  it('handles messageerror through the error path', () => {
    const onError = vi.fn();
    startWatchlistSync(undefined, onError);

    instances[0].onmessageerror?.({ data: null } as MessageEvent);

    expect(onError).toHaveBeenCalled();
    expect(instances[0].terminate).toHaveBeenCalled();
  });
});
