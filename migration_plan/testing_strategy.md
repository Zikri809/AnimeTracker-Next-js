# Testing Strategy

## Goal

Build enough automated confidence to migrate incrementally without changing visible behavior. The test suite should catch regressions in routing, storage, auth, external API handling, responsive UI, and App Router client/server boundaries.

## Tooling

Use Vitest for fast unit and component-level tests. Use Playwright for browser journeys and visual behavior checks.

Recommended packages:

- `vitest`
- `@vitejs/plugin-react`
- `jsdom`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `@playwright/test`
- `msw` or Playwright route interception for upstream API mocking

Recommended scripts:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:e2e": "playwright test",
  "test:e2e:headed": "playwright test --headed",
  "typecheck": "tsc --noEmit",
  "verify": "npm run lint && npm run typecheck && npm run test && npm run test:e2e"
}
```

## Vitest Coverage

### Utility and Domain Logic

- `src/Utility/seasonaldata.js`
  - current season for each month.
  - past/upcoming season around winter and fall boundaries.
  - timezone-safe behavior by injecting dates instead of reading `new Date()` directly.

- `src/Utility/seasonal_carousel/extended_season_data.js`
  - four past and four future seasons are ordered correctly.
  - year changes are correct at boundaries.

- `src/Utility/seasonal_carousel/onlythisseason.js`
  - filters only the requested season/year.
  - handles missing `start_season`.
  - removes invalid or malformed nodes safely.

- `src/Utility/filter/*.js`
  - top score, top members, airing, and completed sort order.
  - stable behavior with missing scores, null dates, duplicate IDs, and empty arrays.

- `src/Utility/safety/storage_parser.js`
  - missing key returns fallback.
  - invalid JSON returns fallback.
  - unexpected shape returns fallback.

- `src/Utility/tracking/*.js`
  - Jikan-to-MAL formatting handles missing episodes, missing title, not-yet-aired status, and missing image.
  - status button mapping matches MAL statuses.
  - save/delete localStorage updates remove the item from all other lists.

### Route Handler Helpers

Extract testable helpers from route handlers before or during migration.

- OAuth authorize URL builder:
  - includes client ID, redirect URI, PKCE challenge, response type, and state.
  - rejects missing env values.

- OAuth callback token exchange parser:
  - fails closed on state mismatch.
  - handles missing `code`, missing `code_verifier`, and MAL error response.

- Refresh token handler:
  - handles expired refresh token.
  - sets access, refresh, and expiry cookies consistently.

- MAL data proxy validation:
  - rejects invalid anime ID.
  - rejects invalid status.
  - rejects scores outside 0 to 10.
  - rejects episode counts below 0.
  - returns upstream error details in a safe shape.

### Component Tests

Keep component tests focused and cheap.

- Nav search submits correct URL with sanitized input.
- Mobile nav active/reset behavior clears sort-related session keys.
- Tracking form disables invalid status buttons for not-yet-aired and currently airing anime.
- MyList tab switching preserves expected active tab labels.
- Backup restore dialog handles empty upload and malformed JSON.

## Playwright Coverage

### Browser Matrix

Run a minimum of:

- Desktop Chromium: `1440x900`.
- Mobile Chromium: Pixel-like viewport.
- Mobile WebKit if CI budget allows, because PWA/safe-area behavior is iOS-sensitive.

### Network Mocking

Use Playwright route interception for:

- `https://api.jikan.moe/v4/**`
- `https://graphql.anilist.co`
- `https://api.myanimelist.net/v2/**`
- `https://myanimelist.net/v1/oauth2/token`

Tests should not depend on live MAL/Jikan/AniList availability.

### Core E2E Journeys

1. Homepage smoke
   - visit `/`.
   - fixed top nav is visible.
   - carousel, this season, last season, upcoming, and season carousel render.
   - no console errors from Server/Client boundary mistakes.

2. Search journey
   - submit a search from home.
   - land on `/search/<title>`.
   - results render from mocked Jikan response.
   - infinite scroll appends more results.
   - scroll restore does not jump unexpectedly after opening and going back.

3. Anime detail journey
   - open `/Anime/<mal_id>`.
   - skeleton or loading state appears if response is delayed.
   - title, image, synopsis, metadata, trailer, and relations render.
   - missing optional fields do not crash the page.

4. Tracking local-only journey
   - open `/Anime/<mal_id>/tracking`.
   - select status, progress, and score.
   - save.
   - localStorage contains the expected list entry.
   - the item is removed from other lists.
   - return navigation goes to the detail route.

5. MyList journey
   - seed localStorage with all five watchlist maps.
   - visit `/mylist`.
   - each tab renders correct items.
   - swipe or tab click changes tabs on mobile.
   - sort controls update the visible order.
   - infinite scroll extends list without losing scroll state.

6. Auth and sync journey
   - visit `/mylist/login`.
   - mock authorize redirect.
   - mock callback token response.
   - verify login success page starts worker sync.
   - verify user list endpoint populates localStorage.
   - verify expired access token triggers refresh behavior.

7. API failure journey
   - make Jikan fail repeatedly.
   - verify route redirects or navigates to `/ExceedRetryLimit`.
   - verify retry button returns to original URL.

8. PWA and mobile shell
   - manifest link exists.
   - Apple startup links exist or equivalent App Router metadata/head output exists.
   - bottom nav does not overlap content on mobile.
   - safe-area padding is preserved.

9. Image rendering
   - remote poster and banner images render from allowed MAL/AniList domains.
   - missing image falls back without layout break.

## Visual Regression Checks

At minimum, capture screenshots for:

- `/`
- `/search/NA`
- `/Anime/1`
- `/Anime/1/tracking`
- `/mylist`
- `/morethiseseason`
- `/seasons/spring/2026`

Compare manually during early phases. Add automated screenshot thresholds only after the App Router shell is stable, otherwise expected churn will create noise.

## CI Gate Order

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test`
5. `npm run build`
6. `npm run test:e2e`

## Edge Cases That Must Have Tests

- Corrupted `localStorage` JSON.
- Missing all watchlist lists on first load.
- Expired `expires_in` cookie.
- Refresh-token endpoint returns 401.
- OAuth callback receives wrong `state`.
- Anime has `episodes: null`.
- Anime has no English title.
- Anime has no trailer.
- Anime relation route has both `mal_id` and `relation_id`.
- Search term contains slash, quote, HTML-like text, or emoji.
- Upstream API returns duplicate anime IDs.
- Upstream API returns 429.
- User navigates away while a worker sync is running.
- Browser back/forward after an infinite-scroll page.
- App served as installed PWA with standalone display mode.
