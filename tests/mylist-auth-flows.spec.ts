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

    await page.click('button:has-text("Connect to MAL Account")');
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

    await page.goto('/mylist/logout_success');
    await expect(page.locator('text=Your Anime World Has Been Disconnected')).toBeVisible();

    const watching = await page.evaluate(() => localStorage.getItem('Watching'));
    const completed = await page.evaluate(() => localStorage.getItem('Completed'));
    
    expect(watching).toBe('[]');
    expect(completed).toBe('[]');
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
