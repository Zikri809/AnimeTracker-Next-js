import { test, expect } from '@playwright/test';

test('homepage loads and displays title', async ({ page }) => {
  await page.goto('/');
  // AniJikan is the expected title of the home page
  await expect(page).toHaveTitle(/AniJikan/i);
});
