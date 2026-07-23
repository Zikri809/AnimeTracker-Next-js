import { test, expect } from '@playwright/test';

async function seedMyListStorage(page: any, fixture: Record<string, any>) {
  await page.addInitScript((data: any) => {
    const keys = ['Watching', 'Completed', 'PlanToWatch', 'OnHold', 'Dropped'];
    for (const key of keys) {
      const val = data[key];
      if (val === null) {
        localStorage.removeItem(key);
      } else if (val !== undefined) {
        localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
      }
    }
  }, fixture);
}

test.describe('My List & Auth Flow E2E Tests', () => {

  test('seed empty storage and visit /mylist', async ({ page }) => {
    await page.route('**/api/users/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: false })
      });
    });
    await page.route('**/api/users/data/user_data', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: 'User data successfully fetched',
          user_data: {
            name: 'MalUser',
            picture: 'https://example.com/avatar.jpg',
            joined_at: '2020-05-15T00:00:00Z',
            anime_statistics: {
              num_items_completed: 45,
              mean_score: 7.85
            }
          }
        })
      });
    });

    await seedMyListStorage(page, {
      Watching: [],
      Completed: [],
      PlanToWatch: [],
      OnHold: [],
      Dropped: []
    });

    await page.goto('/mylist');
    await expect(page.locator('text=No shows in record yet').first()).toBeVisible();
  });

  test('seed populated storage and verify all five tabs and click tab triggers', async ({ page }) => {
    await page.route('**/api/users/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: false })
      });
    });

    const testItem = {
      node: {
        id: 1,
        title: 'Cowboy Bebop',
        main_picture: { large: 'https://example.com/cowboy.jpg' },
        status: 'finished_airing',
        num_episodes: 26,
        genres: [{ id: 1, name: 'Action' }]
      },
      list_status: { score: 9, num_episodes_watched: 5 }
    };

    await seedMyListStorage(page, {
      Watching: [[1, testItem]],
      Completed: [],
      PlanToWatch: [],
      OnHold: [],
      Dropped: []
    });

    await page.goto('/mylist');
    await expect(page.locator('text=No shows in record yet').first()).toBeVisible();

    await page.click('button[role="tab"]:has-text("Watching")');
    await expect(page.locator('text=Cowboy Bebop').first()).toBeVisible();
  });

  test('corrupt one storage key and verify fallback UI', async ({ page }) => {
    await page.route('**/api/users/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: false })
      });
    });

    await seedMyListStorage(page, {
      Watching: 'corrupted raw string data',
      Completed: []
    });

    await page.goto('/mylist');
    await page.click('button[role="tab"]:has-text("Watching")');
    await expect(page.locator('text=No shows in record yet').first()).toBeVisible();
  });

  test('sort each supported sort mode and clear sort', async ({ page }) => {
    await page.route('**/api/users/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: false })
      });
    });

    const anime1 = {
      node: { id: 1, title: 'Anime 1', mean: 8.0, num_scoring_users: 100, popularity: 50, status: 'finished_airing' },
      list_status: { score: 8 }
    };
    const anime2 = {
      node: { id: 2, title: 'Anime 2', mean: 9.0, num_scoring_users: 200, popularity: 20, status: 'finished_airing' },
      list_status: { score: 9 }
    };

    await seedMyListStorage(page, {
      PlanToWatch: [[1, anime1], [2, anime2]]
    });

    await page.goto('/mylist');

    // Click sort funnel button
    await page.click('button:has(.lucide-funnel)');
    
    // Sort by Top Score
    await page.click('button:has-text("Top Score")');
    
    const titles = page.locator('a .font-bold');
    await expect(titles.first()).toHaveText('Anime 2');

    // Clear sort
    await page.click('button:has(.lucide-funnel)');
    await page.click('button:has-text("Top Score")'); // Toggle off
    
    await expect(titles.first()).toHaveText('Anime 1');
  });

  test('login process redirects to MAL authorize route', async ({ page }) => {
    await page.goto('/mylist/login');

    await page.route('**/api/users/auth/authorize', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: 'Redirected to MyAnimeList'
      });
    });

    await page.click('button:has-text("Continue with MyAnimeList")');
    await page.waitForURL('**/api/users/auth/authorize');
    await expect(page.locator('body')).toContainText('Redirected to MyAnimeList');
  });

  test('logout success clears all watchlists and session storage keys', async ({ page }) => {
    await page.route('**/api/users/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: false })
      });
    });

    await seedMyListStorage(page, {
      Watching: [[1, { node: { id: 1 }, list_status: {} }]],
      Completed: [[2, { node: { id: 2 }, list_status: {} }]]
    });

    // Seed wasAuthenticated to simulate a prior logged-in session.
    await page.addInitScript(() => {
      localStorage.setItem('wasAuthenticated', '1');
    });

    await page.goto('/mylist/logout_success');
    await expect(page.locator('text=You\'ve Been Logged Out')).toBeVisible();

    // Use expect.poll to wait for the cleanup effect to finish writing.
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('Watching')), { timeout: 10000 }).toBe('[]');
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('Completed')), { timeout: 10000 }).toBe('[]');
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('wasAuthenticated')), { timeout: 10000 }).toBeNull();
  });

  test('profile route renders user card data and statistics', async ({ page }) => {
    await page.route('**/api/users/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          accessTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
          hasRefreshToken: true,
          userData: {
            name: 'MalUser',
            picture: 'https://example.com/avatar.jpg',
            joined_at: '2020-05-15T00:00:00Z',
            anime_statistics: {
              num_items_completed: 45,
              mean_score: 7.85
            }
          }
        })
      });
    });

    await seedMyListStorage(page, {
      Completed: [
        [1, { node: { id: 1, title: 'Cowboy Bebop', main_picture: { large: 'https://example.com/c.jpg' }, mean: 9.0 }, list_status: { score: 10 } }]
      ]
    });

    await page.goto('/mylist/user_profile');

    await expect(page.locator('text=@MalUser')).toBeVisible();
    await expect(page.locator('text=45')).toBeVisible();
    await expect(page.locator('text=Cowboy Bebop').first()).toBeVisible();
  });
});

test.describe('Silent session expiry handling on /mylist', () => {
  test('shows Session expired toast when wasAuthenticated flag set and session is now unauthenticated', async ({ page }) => {
    await page.route('**/api/users/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: false,
          accessTokenExpiresAt: null,
          hasRefreshToken: false,
          userData: null,
        })
      });
    });
    await page.route('**/api/users/auth/refresh_accesstoken', async (route) => {
      await route.fulfill({ status: 401 });
    });

    await page.addInitScript(() => {
      localStorage.setItem('wasAuthenticated', '1');
      localStorage.setItem('Watching', JSON.stringify([[1, { node: { id: 1, title: 'Stale Show' }, list_status: {} }]]));
    });

    await page.goto('/mylist');

    await expect(page.locator('[data-sonner-toast]').filter({ hasText: 'Session expired' })).toBeVisible({ timeout: 10000 });

    // Marker should be cleared after firing once (no nagging on next open).
    const wasAuthed = await page.evaluate(() => localStorage.getItem('wasAuthenticated'));
    expect(wasAuthed).toBeNull();
  });

  test('does NOT show Session expired toast for local-only users (flag absent)', async ({ page }) => {
    await page.route('**/api/users/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: false,
          accessTokenExpiresAt: null,
          hasRefreshToken: false,
          userData: null,
        })
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('Watching', JSON.stringify([[1, { node: { id: 1, title: 'Local Show' }, list_status: {} }]]));
    });

    await page.goto('/mylist');

    // Give the session check a moment to fire; toast should never appear.
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);

    // Flag still absent.
    const wasAuthed = await page.evaluate(() => localStorage.getItem('wasAuthenticated'));
    expect(wasAuthed).toBeNull();
  });

  test('authenticated session sets wasAuthenticated marker and shows no expiry toast', async ({ page }) => {
    await page.route('**/api/users/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          accessTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
          hasRefreshToken: true,
          userData: { name: 'MalUser' },
        })
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('Watching', JSON.stringify([]));
    });

    await page.goto('/mylist');

    await page.waitForTimeout(2000);
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);

    const wasAuthed = await page.evaluate(() => localStorage.getItem('wasAuthenticated'));
    expect(wasAuthed).toBe('1');
  });

  test('refresh path that restores session does not show expiry toast and sets marker', async ({ page }) => {
    // First session call: expired but has refresh token.
    let sessionCallCount = 0;
    await page.route('**/api/users/auth/session', async (route) => {
      sessionCallCount++;
      if (sessionCallCount === 1) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            authenticated: false,
            accessTokenExpiresAt: null,
            hasRefreshToken: true,
            userData: null,
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            authenticated: true,
            accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
            hasRefreshToken: true,
            userData: { name: 'MalUser' },
          })
        });
      }
    });
    await page.route('**/api/users/auth/refresh_accesstoken', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ message: 'refreshed' }) });
    });

    await page.addInitScript(() => {
      localStorage.setItem('wasAuthenticated', '1');
      localStorage.setItem('Watching', JSON.stringify([]));
    });

    await page.goto('/mylist');

    await page.waitForTimeout(2500);
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);

    const wasAuthed = await page.evaluate(() => localStorage.getItem('wasAuthenticated'));
    expect(wasAuthed).toBe('1');
  });

  test('logout_success clears wasAuthenticated marker even if set', async ({ page }) => {
    await page.route('**/api/users/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: false })
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('wasAuthenticated', '1');
      localStorage.setItem('Watching', JSON.stringify([[1, { node: { id: 1 }, list_status: {} }]]));
    });

    await page.goto('/mylist/logout_success');

    await expect(page.locator('text=You\'ve Been Logged Out')).toBeVisible();
    // Wait for the cleanup effect to remove the marker.
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('wasAuthenticated')), { timeout: 10000 }).toBeNull();
  });

  test('expired toast only fires once per expiry (no re-fire on in-app navigation)', async ({ page }) => {
    let sessionCallCount = 0;
    await page.route('**/api/users/auth/session', async (route) => {
      sessionCallCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: false,
          accessTokenExpiresAt: null,
          hasRefreshToken: false,
          userData: null,
        })
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('wasAuthenticated', '1');
      localStorage.setItem('Watching', JSON.stringify([]));
    });

    await page.goto('/mylist');

    await expect(page.locator('[data-sonner-toast]').filter({ hasText: 'Session expired' })).toBeVisible({ timeout: 10000 });

    // Wait for marker to clear, then check no second toast appears after a delay.
    await page.waitForFunction(() => localStorage.getItem('wasAuthenticated') === null);
    await page.waitForTimeout(2000);

    const toastCount = await page.locator('[data-sonner-toast]').count();
    expect(toastCount).toBeLessThanOrEqual(1);
  });
});

test.describe('Tracking page logged-out indicator', () => {
  test('shows Local-only mode banner when session is unauthenticated', async ({ page }) => {
    await page.route('**/api/users/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: false,
          accessTokenExpiresAt: null,
          hasRefreshToken: false,
          userData: null,
        })
      });
    });

    await page.goto('/mylist/Watching/1/tracking');

    await expect(page.locator('text=Local-only mode')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=You are not logged in')).toBeVisible();
  });

  test('does not show Local-only mode banner when authenticated', async ({ page }) => {
    await page.route('**/api/users/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          accessTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
          hasRefreshToken: true,
          userData: { name: 'MalUser' },
        })
      });
    });

    await page.goto('/mylist/Watching/1/tracking');

    await page.waitForTimeout(2000);
    await expect(page.locator('text=Local-only mode')).toHaveCount(0);
  });
});
