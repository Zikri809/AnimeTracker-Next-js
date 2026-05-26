# Task 06: Static and List Page Migration

## Purpose

Migrate homepage and seasonal/list pages to App Router while preserving ISR-like freshness, infinite scroll, sorting, storage badges, and current layout.

## Requirements

- Server fetch initial data where current `getStaticProps` does so.
- Preserve `revalidate` behavior.
- Keep sorting, scroll restoration, and localStorage status badges in Client Components.
- Preserve all list page URLs.

## Specific Tasks

- Migrate homepage:
  - `src/pages/index.js` to `src/app/page.tsx`.
  - Move server data fetches into the Server Component.
  - Move browser bootstrapping into `HomeClient.tsx`.
- Migrate list routes:
  - `/morethiseseason`
  - `/morelastseason`
  - `/moreupcoming`
  - `/seasons/[season]/[year]`
- Replace `getStaticProps` with `fetch(..., { next: { revalidate: 43200 } })` or segment `export const revalidate = 43200`.
- Replace `getStaticPaths` with `generateStaticParams`.
- Set `dynamicParams = true` for season routes if preserving fallback behavior.
- Add `src/app/search/page.tsx` redirecting to `/search/NA` or fix callers that push `/search/`.
- Keep existing components visually stable:
  - fixed top nav.
  - list grid.
  - skeleton/loading states.
  - mobile bottom padding.
  - horizontal cards.
  - add-status indicators.

## Deliverables

- App Router pages for home and list routes.
- Client components for list interactivity.
- Shared server fetch helpers for seasonal data.
- Removed or archived corresponding Pages Router files after parity.
- Tests for season data and page rendering.

## Definition of Done

- Routes render from `src/app`.
- Data freshness matches previous `revalidate` timing.
- Sorting and infinite scroll match baseline.
- Scroll restore works when returning from detail pages.
- Local watchlist badges appear correctly after storage is seeded.
- No server component imports `localStorage`, `sessionStorage`, `window`, or `document`.

## Testing

- Vitest:
  - seasonal server fetch helper handles empty and malformed upstream responses.
  - season param validation.
  - list sorting helpers.
  - duplicate anime filtering.
- Playwright:
  - homepage renders all major sections.
  - `/morethiseseason`, `/morelastseason`, `/moreupcoming`, and `/seasons/spring/2026` render lists.
  - scrolling appends more list items.
  - seeded localStorage marks added anime.
  - back navigation restores scroll and slice count.
  - upstream failure shows intended fallback or retry path.

## Edge Cases to Watch

- `fetch` defaults in latest Next.js being different from Pages Router ISR expectations.
- Upstream seasonal API returning no `data`.
- Duplicate IDs in seasonal response.
- Seasonal route params with invalid year or invalid season.
- Winter and fall year-boundary calculations.
- Search link pushing `/search/` with no route.
- List page loaded with stale `sessionStorage.sorted_anime`.
- Empty localStorage maps causing `new Map(JSON.parse(null))` crashes.
- Image URLs missing `large`.
