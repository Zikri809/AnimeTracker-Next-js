import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Mock Jikan API for Cowboy Bebop (Finished Airing)
  await page.route('https://api.jikan.moe/v4/anime/1/full', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          mal_id: 1,
          title: "Cowboy Bebop",
          title_english: "Cowboy Bebop English",
          title_japanese: "カウボーイビバップ",
          title_synonyms: ["COWBOY BEBOP"],
          images: {
            webp: {
              large_image_url: "https://example.com/cowboy.webp"
            }
          },
          status: "Finished Airing",
          episodes: 26,
          score: 8.78,
          scored_by: 915000,
          popularity: 39,
          favorites: 78000,
          synopsis: "This is a detailed mock synopsis for Cowboy Bebop.",
          genres: [
            { mal_id: 1, name: "Action" },
            { mal_id: 2, name: "Sci-Fi" }
          ],
          trailer: {
            embed_url: "https://www.youtube.com/embed/gY5nDXOtv_o"
          },
          duration: "24 min per ep",
          broadcast: {
            day: "Saturdays",
            time: "16:00",
            timezone: "Asia/Tokyo"
          },
          season: "spring",
          year: 1998,
          studios: [{ mal_id: 14, name: "Sunrise" }],
          licensors: [{ mal_id: 102, name: "Funimation" }]
        }
      })
    });
  });

  // Mock Jikan API for relation details (Anime 5)
  await page.route('https://api.jikan.moe/v4/anime/5/full', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          mal_id: 5,
          title: "Cowboy Bebop: Tengoku no Tobira",
          title_english: "Cowboy Bebop: The Movie",
          images: {
            webp: {
              large_image_url: "https://example.com/movie.webp"
            }
          },
          status: "Finished Airing",
          episodes: 1,
          score: 8.39,
          synopsis: "Relation movie synopsis.",
          genres: [{ mal_id: 1, name: "Action" }],
          studios: [{ mal_id: 14, name: "Sunrise" }],
          licensors: []
        }
      })
    });
  });

  // Mock Jikan relations
  await page.route('https://api.jikan.moe/v4/anime/1/relations', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            relation: "Side Story",
            entry: [
              {
                mal_id: 5,
                type: "anime",
                name: "Cowboy Bebop: Tengoku no Tobira"
              }
            ]
          }
        ]
      })
    });
  });

  // Mock Jikan API for Anime 2 (Not Yet Aired)
  await page.route('https://api.jikan.moe/v4/anime/2/full', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          mal_id: 2,
          title: "Upcoming Show",
          status: "Not Yet Aired",
          episodes: 12,
          genres: [],
          studios: [],
          licensors: []
        }
      })
    });
  });

  // Mock Jikan API for Anime 3 (Currently Airing)
  await page.route('https://api.jikan.moe/v4/anime/3/full', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          mal_id: 3,
          title: "Airing Show",
          status: "Currently Airing",
          episodes: 12,
          genres: [],
          studios: [],
          licensors: []
        }
      })
    });
  });

  // Mock Jikan API failure for Anime 999
  await page.route('https://api.jikan.moe/v4/anime/999/full', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' })
    });
  });

  // Mock MyAnimeList API for tracking
  await page.route('https://api.myanimelist.net/v2/anime/1**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        title: "Cowboy Bebop",
        alternative_titles: { en: "Cowboy Bebop English" },
        main_picture: { large: "https://example.com/cowboy.webp" },
        status: "finished_airing",
        num_episodes: 26,
        genres: [{ id: 1, name: "Action" }]
      })
    });
  });

  await page.route('https://api.myanimelist.net/v2/anime/2**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 2,
        title: "Upcoming Show",
        status: "not_yet_aired",
        num_episodes: 12,
        genres: []
      })
    });
  });

  await page.route('https://api.myanimelist.net/v2/anime/3**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 3,
        title: "Airing Show",
        status: "currently_airing",
        num_episodes: 12,
        genres: []
      })
    });
  });

  // Mock MAL API failure for Anime 999
  await page.route('https://api.myanimelist.net/v2/anime/999**', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' })
    });
  });

  // Mock local session check route to unauthenticated by default
  await page.route('**/api/users/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ authenticated: false })
    });
  });
});

test('Direct URL access to detail pages and relation pages', async ({ page }) => {
  // 1. Visit details page of Cowboy Bebop
  await page.goto('/Anime/1');

  // Verify English display title
  await expect(page.locator('text=Cowboy Bebop English').first()).toBeVisible();

  // Verify synopsis
  await expect(page.locator('text=This is a detailed mock synopsis for Cowboy Bebop.')).toBeVisible();

  // Verify trailer rendering
  const trailer = page.locator('iframe[src^="https://www.youtube.com/embed/gY5nDXOtv_o"]');
  await expect(trailer).toBeVisible();

  // Verify genres
  await expect(page.locator('text=Action').filter({ visible: true }).first()).toBeVisible();
  await expect(page.locator('text=Sci-Fi').filter({ visible: true }).first()).toBeVisible();

  // Verify relations section renders
  await expect(page.locator('text=Cowboy Bebop: Tengoku no Tobira')).toBeVisible();

  // Navigate to relation page by clicking the link
  await page.locator('text=Cowboy Bebop: Tengoku no Tobira').click();
  await page.waitForURL('**/Anime/1/relation/5');

  // Verify relation page detail displays
  await expect(page.locator('text=Cowboy Bebop: The Movie').first()).toBeVisible();
});

test('Transition to tracking page & status buttons click constraints', async ({ page }) => {
  // 1. Test Not Yet Aired constraints
  await page.goto('/Anime/2/tracking');
  await expect(page.locator('text=Upcoming Show').first()).toBeVisible();

  // Watching and Completed buttons should be disabled for Not Yet Aired
  const watchingButton = page.locator('button:has-text("Watching")');
  await expect(watchingButton).toBeDisabled();
  const completedButton = page.locator('button:has-text("Completed")');
  await expect(completedButton).toBeDisabled();

  // 2. Test Currently Airing constraints
  await page.goto('/Anime/3/tracking');
  await expect(page.locator('text=Airing Show').first()).toBeVisible();

  // Watching is enabled, but Completed is disabled for Currently Airing
  const watchingButton3 = page.locator('button:has-text("Watching")');
  await expect(watchingButton3).toBeEnabled();
  const completedButton3 = page.locator('button:has-text("Completed")');
  await expect(completedButton3).toBeDisabled();
});

test('Watchlist localstorage mutations & tracking client interactions', async ({ page }) => {
  await page.goto('/Anime/1');

  // Verify button content defaults to 'Add to watchlist'
  const addButton = page.locator('button:has-text("Add to watchlist")');
  await expect(addButton).toBeVisible();
  await addButton.click();

  await page.waitForURL('**/Anime/1/tracking');

  // Click Watching status
  const watchingButton = page.locator('button:has-text("Watching")');
  await watchingButton.click();

  // Save the status
  const saveButton = page.locator('button:has-text("Save")');
  await saveButton.click();

  // Wait for it to redirect back to details page
  await page.waitForURL('**/Anime/1');

  // Verify localStorage contains the anime in 'Watching' watchlist
  const watchingList = await page.evaluate(() => localStorage.getItem('Watching'));
  expect(watchingList).not.toBeNull();
  const watchingArray = JSON.parse(watchingList!);
  expect(watchingArray.length).toBe(1);
  expect(watchingArray[0][0]).toBe(1); // mal_id is 1

  // Verify watchlist badge text on the button changed
  await expect(page.locator('button:has-text("Watching - Ep 0/26")')).toBeVisible();

  // Go to tracking again to remove it
  await page.locator('button:has-text("Watching - Ep 0/26")').click();
  await page.waitForURL('**/Anime/1/tracking');

  // Click Remove from Watchlist
  const removeButton = page.locator('button:has-text("Remove from Watchlist")');
  await expect(removeButton).toBeEnabled();
  await removeButton.click();

  // Redirect back to details page
  await page.waitForURL('**/Anime/1');

  // Verify localStorage is updated (empty)
  const watchingListAfter = await page.evaluate(() => localStorage.getItem('Watching'));
  expect(watchingListAfter).not.toBeNull();
  expect(JSON.parse(watchingListAfter!).length).toBe(0);

  // Button shows Add to watchlist again
  await expect(page.locator('button:has-text("Add to watchlist")')).toBeVisible();
});

test('Redirects to ExceedRetryLimit page on API failures', async ({ page }) => {
  // Visit the detail page for a broken ID (999)
  await page.goto('/Anime/999');

  // Assert it redirect to ExceedRetryLimit page
  await page.waitForURL('**/ExceedRetryLimit*');

  // Wait for retry limit screen to mount
  await expect(page.locator('text=Loading...')).not.toBeVisible();
  await expect(page.locator('text=Retry Limit Exceeded!')).toBeVisible();

  const bodyText = await page.locator('body').innerText();
  expect(bodyText.toLowerCase()).toContain('exceed');
});

test('ExceedRetryLimit direct access with missing params and open-redirect protection', async ({ page }) => {
  // 1. Direct access with missing parameters: should safely load
  await page.goto('/ExceedRetryLimit');
  await expect(page.locator('text=Retry Limit Exceeded!')).toBeVisible();

  // Try again button should point to home / or be clicked safely without crashing
  const tryAgainBtn = page.locator('button:has-text("Try Again")');
  await expect(tryAgainBtn).toBeVisible();

  // 2. Open redirect security validation: visit with external link
  await page.goto('/ExceedRetryLimit?original_link=https://malicious.com/attack');
  await expect(page.locator('text=Retry Limit Exceeded!')).toBeVisible();

  // Click Try Again
  await tryAgainBtn.click();
  // It should safely redirect/navigate to homepage '/' and NOT malicious.com
  await page.waitForURL('**/');
  expect(page.url()).not.toContain('malicious.com');
});

