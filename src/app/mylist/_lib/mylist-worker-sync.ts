import {
  normalizeWatchlistEntries,
  serializeWatchlistMap,
  WatchlistKey,
} from '@/Utility/tracking/watchlist-storage';

export interface SyncResult {
  success: boolean;
  categoryResults: Record<string, 'success' | 'failed'>;
  errors: any[];
}

let activeSyncSessionId = 0;
let activeWorker: Worker | null = null;
const WORKER_TIMEOUT_MS = 30000;

export function getActiveSyncSessionId() {
  return activeSyncSessionId;
}

export function invalidateSyncSession() {
  activeSyncSessionId++;
  if (activeWorker) {
    activeWorker.terminate();
    activeWorker = null;
  }
}

// BroadcastChannel to invalidate sync across tabs on logout
export const logoutChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('auth-logout-channel') : null;
if (logoutChannel) {
  logoutChannel.onmessage = (e) => {
    if (e.data === 'logout') {
      invalidateSyncSession();
    }
  };
}

export function startWatchlistSync(onComplete?: (result: SyncResult) => void, onError?: (err: any) => void) {
  if (typeof Worker === 'undefined') {
    onError?.(new Error('Web Worker not supported in this environment'));
    return null;
  }

  // Create unique session ID for this sync run
  activeSyncSessionId++;
  const currentSessionId = activeSyncSessionId;

  // Terminate any previous active worker to prevent concurrent sync operations
  if (activeWorker) {
    activeWorker.terminate();
  }

  const worker = new Worker('/worker/worker.js');
  activeWorker = worker;
  let finished = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = setTimeout(() => {
    finishWithError(new Error('Worker sync timed out'));
  }, WORKER_TIMEOUT_MS);

  function clearWorkerTimeout() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function clearActiveWorker() {
    clearWorkerTimeout();
    worker.terminate();
    if (activeWorker === worker) {
      activeWorker = null;
    }
  }

  function finishWithError(err: any) {
    if (finished) return;
    finished = true;
    clearActiveWorker();
    onError?.(err);
  }

  function finishWithSuccess(result: SyncResult) {
    if (finished) return;
    finished = true;
    clearActiveWorker();
    onComplete?.(result);
  }

  worker.onmessage = (e) => {
    // Check if this session is still valid (has not been invalidated by logout, newer sync, or unmount)
    if (currentSessionId !== activeSyncSessionId) {
      console.log('Stale sync message discarded');
      clearActiveWorker();
      return;
    }

    const { collectionarr, categoryResults, errors } = e.data;

    if (!collectionarr || !Array.isArray(collectionarr) || collectionarr.length < 5) {
      finishWithError(new Error('Invalid worker response structure'));
      return;
    }
    if (!categoryResults || typeof categoryResults !== 'object') {
      finishWithError(new Error('Invalid worker response metadata'));
      return;
    }

    try {
      // Map category lists to their corresponding localStorage keys in order
      const categoriesOrder: WatchlistKey[] = ['Watching', 'Completed', 'OnHold', 'Dropped', 'PlanToWatch'];
      const writes: Array<{ key: WatchlistKey; previous: string | null; next: string }> = [];

      for (let i = 0; i < categoriesOrder.length; i++) {
        const categoryKey = categoriesOrder[i];
        
        // Only replace if this category succeeded
        if (categoryResults[categoryKey] === 'success') {
          const rawEntries = collectionarr[i];
          const map = normalizeWatchlistEntries(rawEntries);
          if (!map) {
            throw new Error(`Invalid worker payload for ${categoryKey}`);
          }

          writes.push({
            key: categoryKey,
            previous: localStorage.getItem(categoryKey),
            next: serializeWatchlistMap(map),
          });
        }
      }

      const completedWrites: typeof writes = [];
      try {
        for (const write of writes) {
          localStorage.setItem(write.key, write.next);
          completedWrites.push(write);
        }
      } catch (writeError) {
        for (const write of completedWrites.reverse()) {
          try {
            if (write.previous === null) {
              localStorage.removeItem(write.key);
            } else {
              localStorage.setItem(write.key, write.previous);
            }
          } catch {
            // Best-effort rollback.
          }
        }
        throw writeError;
      }

      finishWithSuccess({
        success: true,
        categoryResults: categoryResults || {},
        errors: errors || []
      });
    } catch (err) {
      finishWithError(err);
    }
  };

  worker.onerror = (err) => {
    if (currentSessionId !== activeSyncSessionId) {
      clearActiveWorker();
      return;
    }
    finishWithError(err);
  };

  worker.onmessageerror = (err) => {
    if (currentSessionId !== activeSyncSessionId) {
      clearActiveWorker();
      return;
    }
    finishWithError(err);
  };

  worker.postMessage('start');

  return {
    terminate: () => {
      if (currentSessionId === activeSyncSessionId) {
        activeSyncSessionId++; // Invalidate this session
      }
      clearActiveWorker();
    }
  };
}
