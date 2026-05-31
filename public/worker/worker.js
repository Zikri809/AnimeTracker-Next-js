console.log('Worker script started');

const STATUS_MAP = {
  'watching': 'Watching',
  'completed': 'Completed',
  'on_hold': 'OnHold',
  'dropped': 'Dropped',
  'plan_to_watch': 'PlanToWatch'
};

const watchlistarr = ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch'];

self.onmessage = async (event) => {
  if (event.data !== 'start') return;

  const collectionarr = [];
  const categoryResults = {
    Watching: 'failed',
    Completed: 'failed',
    OnHold: 'failed',
    Dropped: 'failed',
    PlanToWatch: 'failed'
  };
  const errors = [];
  let userDataResult = 'failed';
  let userData = null;
  let authFailed = false;

  // 1. Fetch user list for each status
  for (const status of watchlistarr) {
    const categoryKey = STATUS_MAP[status];
    
    if (authFailed) {
      collectionarr.push([]);
      continue;
    }

    const datamap = new Map();
    let nextOffset = 0;
    let hasNext = true;
    let pageCount = 0;
    const maxPages = 50; // Safeguard against infinite pagination
    let categoryFailed = false;

    while (hasNext && pageCount < maxPages) {
      pageCount++;
      const result = await fetchWithRetry(nextOffset, status);
      
      if (!result.success) {
        categoryFailed = true;
        errors.push({
          category: categoryKey,
          status: result.status,
          message: result.message || 'Fetch failed'
        });
        if (result.status === 401 || result.status === 403) {
          authFailed = true;
        }
        break;
      }

      const resultjson = result.data;
      if (!resultjson || typeof resultjson !== 'object' || !Array.isArray(resultjson.data)) {
        categoryFailed = true;
        errors.push({
          category: categoryKey,
          message: 'Malformed API payload: data is not an array'
        });
        break;
      }

      for (const element of resultjson.data) {
        if (element && element.node && typeof element.node.id === 'number') {
          datamap.set(element.node.id, element);
        }
      }

      if (resultjson.paging && typeof resultjson.paging.next === 'string' && resultjson.paging.next !== '') {
        const nextUrl = resultjson.paging.next;
        const match = nextUrl.match(/[?&]offset=(\d+)/);
        if (match) {
          nextOffset = parseInt(match[1], 10);
        } else {
          categoryFailed = true;
          errors.push({
            category: categoryKey,
            message: 'Malformed paging.next: missing offset'
          });
          break;
        }
      } else {
        hasNext = false;
      }
    }

    if (!categoryFailed && hasNext && pageCount >= maxPages) {
      categoryFailed = true;
      errors.push({
        category: categoryKey,
        message: 'Max page limit reached before pagination completed'
      });
    }

    if (!categoryFailed) {
      categoryResults[categoryKey] = 'success';
      collectionarr.push(Array.from(datamap.entries()));
    } else {
      collectionarr.push([]);
    }
  }

  // 2. Fetch user data
  if (!authFailed) {
    const userResult = await fetchUserDataWithRetry();
    if (userResult.success) {
      userDataResult = 'success';
      userData = userResult.data;
    } else {
      errors.push({
        category: 'UserData',
        status: userResult.status,
        message: userResult.message || 'Fetch user data failed'
      });
    }
  }

  // 3. Post back the complete message payload
  self.postMessage({
    collectionarr,
    categoryResults,
    errors,
    userDataResult,
    userData
  });
};

async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

async function fetchWithRetry(offset, status) {
  let attempt = 0;
  while (attempt < 2) {
    attempt++;
    try {
      const response = await fetchWithTimeout(`/api/users/data/userlist?sort=list_updated_at&offset=${offset}&status=${status}`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'same-origin'
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }

      if (response.status === 401 || response.status === 403) {
        if (attempt === 1) {
          const refreshed = await refreshAccessTokenWithLock();
          if (refreshed) {
            continue; // Retry once
          }
        }
      }

      return {
        success: false,
        status: response.status,
        message: `HTTP ${response.status}`
      };
    } catch (e) {
      return {
        success: false,
        message: e.message || 'Network error'
      };
    }
  }
  return { success: false, message: 'Max attempts reached' };
}

async function fetchUserDataWithRetry() {
  let attempt = 0;
  while (attempt < 2) {
    attempt++;
    try {
      const response = await fetchWithTimeout('/api/users/data/user_data', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'same-origin'
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }

      if (response.status === 401 || response.status === 403) {
        if (attempt === 1) {
          const refreshed = await refreshAccessTokenWithLock();
          if (refreshed) {
            continue; // Retry once
          }
        }
      }

      return {
        success: false,
        status: response.status,
        message: `HTTP ${response.status}`
      };
    } catch (e) {
      return {
        success: false,
        message: e.message || 'Network error'
      };
    }
  }
  return { success: false, message: 'Max attempts reached' };
}

async function refreshAccessTokenWithLock() {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request('auth-refresh-lock', async () => {
      try {
        const sessionRes = await fetchWithTimeout('/api/users/auth/session', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'same-origin'
        });
        if (sessionRes.ok) {
          const session = await sessionRes.json();
          if (session.authenticated && session.accessTokenExpiresAt) {
            const expiryDate = new Date(session.accessTokenExpiresAt).getTime();
            if (expiryDate > Date.now() + 10000) {
              return true; 
            }
          }
        }
      } catch (e) {
        // Ignore check errors
      }

      try {
        const refreshRes = await fetchWithTimeout('/api/users/auth/refresh_accesstoken', {
          method: 'POST',
          cache: 'no-store',
          credentials: 'same-origin'
        });
        return refreshRes.ok;
      } catch (e) {
        return false;
      }
    });
  } else {
    try {
      const refreshRes = await fetchWithTimeout('/api/users/auth/refresh_accesstoken', {
        method: 'POST',
        cache: 'no-store',
        credentials: 'same-origin'
      });
      return refreshRes.ok;
    } catch (e) {
      return false;
    }
  }
}
