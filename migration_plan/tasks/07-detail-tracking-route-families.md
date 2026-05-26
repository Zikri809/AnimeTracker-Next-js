# Task 07: Anime Detail, Relation, and Tracking Routes

## Purpose

Migrate the duplicated anime detail, relation, and tracking route families while preserving existing route-specific navigation and local/MAL watchlist behavior.

## Requirements

- Preserve every existing public route.
- Reduce duplication only after one route family proves parity.
- Keep tracking UI client-side because it owns refs, carousel controls, toasts, localStorage, and route navigation.
- Keep optional data handling robust for incomplete Jikan responses.

## Specific Tasks

- Pick one pilot route family, preferably `/Anime/[mal_id]`.
- Create reusable components:
  - `AnimeDetailPage` server wrapper.
  - `AnimeDetailClient`.
  - `TrackingPage` server wrapper if needed.
  - `TrackingClient`.
  - relation route helpers.
- Migrate:
  - `/Anime/[mal_id]`
  - `/Anime/[mal_id]/tracking`
  - `/Anime/[mal_id]/relation/[relation_id]`
  - `/Anime/[mal_id]/relation/[relation_id]/tracking`
- After pilot parity, migrate equivalent families:
  - `/morethiseseason/[mal_id]/**`
  - `/morelastseason/[mal_id]/**`
  - `/moreupcoming/[mal_id]/**`
  - `/search/[title]/[mal_id]/**`
  - `/mylist/[mylist_tab]/[mal_id]/**`
  - `/seasons/[season]/[year]/[mal_id]/**`
- Replace `router.query` with `params`.
- Replace retry navigation to `/ExceedRetryLimit` using App Router navigation.
- Fix known malformed route construction in relation tracking URLs.
- Preserve synopsis expand/collapse behavior.
- Preserve trailer iframe rendering.
- Preserve add-to-watchlist and remove behavior.

## Deliverables

- App Router detail and tracking routes for all route families.
- Shared typed route param helpers.
- Shared typed Jikan-to-MAL mapping.
- Removed duplicate Pages Router detail/tracking files after parity.
- Playwright route-family smoke tests.

## Definition of Done

- Every old detail/tracking URL resolves under `src/app`.
- Detail pages render the same visual sections as baseline.
- Tracking save/delete updates localStorage exactly as before.
- Authenticated tracking still calls MAL proxy endpoints.
- Relation routes use the relation ID for fetched detail data and preserve source context.
- Retry route behavior still works after repeated API failure.

## Testing

- Vitest:
  - Jikan response normalization.
  - route param parsing for each family.
  - tracking status/progress/score mapping.
  - localStorage list mutation helpers.
- Playwright:
  - detail page renders with full mocked anime data.
  - detail page renders with missing optional fields.
  - relation route renders relation anime.
  - tracking page saves to localStorage.
  - delete removes from all lists.
  - authenticated save/delete calls mocked MAL route handlers.
  - repeated Jikan failure navigates to retry page.

## Edge Cases to Watch

- `mal_id` and `relation_id` both present and the wrong one used.
- Anime has `episodes: null` and progress carousel length becomes invalid.
- Anime is not yet aired and buttons should be disabled.
- Anime is currently airing and completed should be disabled.
- Missing English title.
- Missing `images.webp.large_image_url`.
- Missing `broadcast`, `trailer`, `studios`, `genres`, or `synopsis`.
- Synopsis ref is null during hydration.
- DOM mutation with `innerHTML` breaks React expectations.
- Back-link path accidentally strips too many segments.
- Duplicate localStorage entries across watchlist categories.
