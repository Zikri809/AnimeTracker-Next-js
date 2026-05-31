import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Mock Jikan API
  await page.route('https://api.jikan.moe/v4/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: Array.from({ length: 24 }, (_, i) => ({
          mal_id: i + 1,
          title: `Mocked Jikan Anime ${i + 1}`,
          title_english: `Mocked Jikan Anime EN ${i + 1}`,
          images: { webp: { large_image_url: `https://example.com/jikan-${i + 1}.jpg` } },
          year: 2026,
          score: 8.5,
          status: 'Currently Airing'
        }))
      })
    });
  });

  // Mock AniList GraphQL API
  await page.route('https://graphql.anilist.co', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          Page: {
            media: [
              {
                idMal: 1,
                bannerImage: 'https://example.com/banner.jpg',
                genres: ['Action'],
                title: { english: 'Mocked Spotlight English', romaji: 'Mocked Spotlight Romaji' }
              }
            ]
          }
        }
      })
    });
  });

  // Mock MyAnimeList API
  await page.route('https://api.myanimelist.net/v2/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: Array.from({ length: 50 }, (_, i) => ({
          node: {
            id: i + 1,
            title: `Mocked MAL Anime ${i + 1}`,
            alternative_titles: { en: `Mocked MAL Anime EN ${i + 1}` },
            main_picture: { large: `https://example.com/anime-${i + 1}.jpg` },
            status: i % 2 === 0 ? 'finished_airing' : 'currently_airing',
            start_season: { season: 'spring', year: 2026 },
            num_episodes: 12,
            mean: 8.0 - (i * 0.1),
            num_scoring_users: 1000 + i,
            popularity: i + 1,
            genres: [{ id: 1, name: 'Action' }]
          }
        }))
      })
    });
  });
});

test('Homepage load, title, layout, search redirects, and localstorage bootstrapping', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('/');

  // 1. Verify title
  await expect(page).toHaveTitle(/AniJikan/i);

  // 2. Fixed top nav is visible
  const nav = page.locator('nav').first();
  await expect(nav).toBeVisible();

  // 3. Spotlight carousel renders mocked AniList items
  const spotlight = page.locator('text=Spotlight');
  await expect(spotlight.first()).toBeVisible();

  // 4. This Season, Last Season, Upcoming Season sections render
  await expect(page.locator('text=This Season').first()).toBeVisible();
  await expect(page.locator('text=Last Season').first()).toBeVisible();
  await expect(page.locator('text=Upcoming Season').first()).toBeVisible();
  await expect(page.locator('text=Seasons').first()).toBeVisible();

  // 5. Check localStorage bootstrapping
  const keys = ['Watching', 'Completed', 'PlanToWatch', 'OnHold', 'Dropped'];
  for (const key of keys) {
    const val = await page.evaluate((k) => localStorage.getItem(k), key);
    expect(val).not.toBeNull();
    expect(JSON.parse(val!)).toBeInstanceOf(Array);
  }

  // 6. Verify console errors
  expect(consoleErrors.filter(err => err.includes('localStorage is not defined') || err.includes('window is not defined') || err.includes('hydration')).length).toBe(0);

  // 7. Desktop search redirects to /search/NA on empty search
  const isMobile = page.viewportSize()?.width ? page.viewportSize()!.width < 640 : false;
  if (!isMobile) {
    const searchInput = page.locator('input[placeholder="Search anime..."]');
    const searchButton = page.locator('nav button[type="submit"]');
    await expect(searchInput).toBeVisible();
    await expect(searchButton).toBeVisible();

    // Press submit on empty input
    await searchButton.click();
    await page.waitForURL('**/search/NA');

    // Navigate back and try normal search
    await page.goto('/');
    await searchInput.fill('naruto');
    await searchButton.click();
    await page.waitForURL('**/search/naruto');
  }
});

test('List route: rendering, infinite scroll, sorting, back button, and watchlist badges', async ({ page }) => {
  // 1. Navigate to /morethiseseason
  await page.goto('/morethiseseason');

  // Verify list title
  await expect(page.locator('text=This Season').first()).toBeVisible();

  // Each list initially shows at most 30 cards
  const cardsBefore = page.locator('a[href^="/morethiseseason/"]');
  await expect(cardsBefore).toHaveCount(30);

  const firstHref = await cardsBefore.first().getAttribute('href');
  const firstId = Number(firstHref?.split('/').pop());
  expect(Number.isFinite(firstId)).toBe(true);

  await page.evaluate((animeId) => {
    localStorage.setItem('PlanToWatch', JSON.stringify([[animeId, { node: { id: animeId } }]]));
  }, firstId);
  await page.reload();

  await expect(page.locator(`a[href="/morethiseseason/${firstId}"] svg.lucide-check-check`)).toBeVisible();

  // 2. Scrolling near the bottom appends more cards (infinite scroll)
  await page.evaluate(() => window.scrollTo(0, document.body.offsetHeight));
  // Wait for new cards to render
  await expect.poll(async () => page.locator('a[href^="/morethiseseason/"]').count()).toBeGreaterThan(30);

  // 3. Sort menu changes visible order and resets scroll/slice state
  const topNav = page.locator('nav').first();
  const sortButton = topNav.locator('button').last(); // funnel icon button
  await sortButton.click();

  // Click on "Top Score" sorting option
  const topScoreOption = page.locator('span:has-text("Top Score")');
  await expect(topScoreOption).toBeVisible();
  await topScoreOption.click();

  // Sorted list count resets to 30
  await expect(page.locator('a[href^="/morethiseseason/"]')).toHaveCount(30);

  // 4. Back button clears list sort state and returns to /
  const topNavForBack = page.locator('nav').first();
  const backButton = topNavForBack.locator('button').first(); // ChevronLeft back button
  await backButton.click();
  await page.waitForURL('**/');

  // Verify global/scoped sort state is reset/redirected correctly
  const storedSort = await page.evaluate(() => sessionStorage.getItem('season-list:/morethiseseason:sort_type'));
  expect(storedSort).toBeNull();
});

test('Sibling static list routes and dynamic season route keep the same list shell', async ({ page }) => {
  const routes = [
    { path: '/morelastseason', title: 'Last Season', hrefPrefix: '/morelastseason/' },
    { path: '/moreupcoming', title: 'Upcoming Season', hrefPrefix: '/moreupcoming/' },
    { path: '/seasons/spring/2026', title: 'Spring, 2026', hrefPrefix: '/seasons/spring/2026/' },
  ];

  for (const routeInfo of routes) {
    await page.goto(routeInfo.path);

    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
    await expect(nav).toContainText(routeInfo.title);

    const visibleCards = await page.locator(`a[href^="${routeInfo.hrefPrefix}"]`).count();
    expect(visibleCards).toBeLessThanOrEqual(30);
  }

  await page.goto('/seasons/monsoon/2026');
  await expect(page.locator('body')).toContainText('404');
});
