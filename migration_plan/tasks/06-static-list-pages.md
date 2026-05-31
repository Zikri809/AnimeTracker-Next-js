# Task 06: Static and List Page Migration

## Purpose

Move the homepage and static seasonal/list pages from Pages Router to App Router while preserving public URLs, 12-hour ISR-style freshness, current season calculations, sorting, infinite scroll, scroll restoration, local watchlist badges, and the existing visual layout.

This task is the first user-facing page migration after the App Router shell, router-boundary cleanup, and API route migration. Keep it behavior-preserving and do not pull detail, tracking, mylist, or search result migration work into this task except for the `/search` index redirect called out below.

## Current Route Inventory

| Public route | Current Pages Router file | New App Router file | Notes |
| --- | --- | --- | --- |
| `/` | `src/pages/index.js` | `src/app/page.tsx` | Server-fetches homepage data, then hydrates browser-only bootstrapping. |
| `/morethiseseason` | `src/pages/morethiseseason/index.tsx` | `src/app/morethiseseason/page.tsx` | Static MAL seasonal list for current season. |
| `/morelastseason` | `src/pages/morelastseason/index.tsx` | `src/app/morelastseason/page.tsx` | Static MAL seasonal list for previous season. |
| `/moreupcoming` | `src/pages/moreupcoming/index.tsx` | `src/app/moreupcoming/page.tsx` | Static MAL seasonal list for upcoming season. |
| `/seasons/[season]/[year]` | `src/pages/seasons/[season]/[year]/index.tsx` | `src/app/seasons/[season]/[year]/page.tsx` | Dynamic static route with `fallback: 'blocking'` behavior. |
| `/search` | none or broken empty-search target | `src/app/search/page.tsx` | Redirect to `/search/NA`. |

Do not migrate these route families in this task:

- `/morethiseseason/[mal_id]/**`
- `/morelastseason/[mal_id]/**`
- `/moreupcoming/[mal_id]/**`
- `/seasons/[season]/[year]/[mal_id]/**`
- `/search/[title]/**`
- `/Anime/**`
- `/mylist/**`
- `/ExceedRetryLimit`

Those belong to Tasks 07 and 08. Links from the newly migrated list pages may continue to target the existing Pages Router detail routes until those later tasks migrate them.

## Non-Negotiable Constraints

- Preserve every public URL listed in the inventory.
- Do not leave active duplicate `src/pages/**` and `src/app/**` routes for the same public path after parity is confirmed. Remove the old Pages Router file in the same implementation slice that adds the matching App Router page.
- Do not import `next/router` in any new App Router page or client component.
- Do not import `localStorage`, `sessionStorage`, `window`, `document`, browser storage helpers, or client hooks into Server Components.
- Do not call app API routes from Server Components for data already available through server helpers. Fetch upstream directly from server helpers so App Router caching and revalidation are explicit.
- Do not reuse `src/server/mal/client.ts::fetchSeasonal` for static page data as-is, because that helper uses `cache: 'no-store'` for the API proxy. Static pages need cached fetches with `next: { revalidate: 43200 }`.
- Any JavaScript or JSX file touched by this task must be converted to TypeScript or TSX in the same change, unless the file is being deleted after its App Router replacement is verified.
- Do not add new `.js` or `.jsx` files for this task.
- Keep `Client_ID` server-only. Never expose it through props, client components, logs, or browser bundles.
- Keep the list page initial render static and server-fetched. Sorting, storage badges, infinite scroll, and scroll restoration must live in Client Components.
- Keep the existing layout classes and component composition. Any small App Router correctness change must be covered by a visual or component test.
- Run the migration route-by-route. Verify each route before deleting its Pages Router counterpart.

## Data Freshness Contract

Use one shared constant for static page freshness:

```ts
export const SEASONAL_PAGE_REVALIDATE_SECONDS = 43200;
```

Expected behavior:

- Successful homepage and list data must refresh every 12 hours, matching the previous `revalidate: 43200`.
- The old homepage attempted to retry sooner when the AniList carousel data was empty by returning `revalidate: 60`. App Router cannot express a fully dynamic route-level `revalidate` return in the same way as `getStaticProps`. Do not accidentally cache an empty critical homepage carousel for 12 hours.
- Required homepage failure policy:
  - Use cached upstream `fetch` calls with `next: { revalidate: SEASONAL_PAGE_REVALIDATE_SECONDS }` for successful data.
  - Treat the AniList spotlight carousel as critical. If AniList returns a non-2xx response, malformed JSON, or an empty `data.Page.media` list, throw from the server helper so production keeps the previous successfully generated route instead of serving an empty spotlight for 12 hours.
  - For non-critical homepage season strips, return the current `{ querydata: [], isloading: true, error: true }` shape and let the client show existing loading/error visuals.
  - Document this as the App Router equivalent of the old short-retry behavior.
  - This can fail the initial `next build` if AniList is unavailable and there is no previous ISR cache. Treat that as fail-fast for this task; if the project decides build-time upstream failures must never fail CI, change this policy before implementation and update these tests.
- Treat this as the required failure policy for this task. Silent cache-policy changes are not acceptable.

Avoid these fetch options in static page helpers:

- `cache: 'no-store'`
- `next: { revalidate: 0 }`
- `export const dynamic = 'force-dynamic'`
- `fetchCache = 'force-no-store'`

Those are correct for auth/user API routes, but they defeat the purpose of this task.

## App Shell Parity

Migrating `/` and the list pages means those routes stop using `src/pages/_app.js` and start using `src/app/layout.tsx` plus `src/app/providers.tsx`. Before deleting `src/pages/index.js`, verify App Router shell parity:

- `src/app/layout.tsx` imports `@/styles/globals.css`.
- The Poppins font setup matches the Pages Router shell closely enough that screenshots do not shift unexpectedly.
- `viewport` includes `width: "device-width"`, `initialScale: 1`, `minimumScale: 1`, and `viewportFit: "cover"`.
- Metadata includes the manifest, Google verification, and Apple startup images currently supplied by `_app.js`.
- `src/app/providers.tsx` includes `Persistent_worker`, `SeasonProvider`, `QueryClientProvider`, Vercel Analytics, Speed Insights, and `Mobile_navbar`.
- App Router pages show exactly one mobile bottom navbar and exactly one persistent worker wrapper.
- Existing Pages Router routes still use `_app.js` until their own migration tasks. Do not delete `_app.js` in this task.

Add a Playwright smoke check for `/` after migration that verifies the manifest link, one mobile nav, and no obvious app-shell hydration errors.

## TypeScript Conversion Scope

This task should leave the migrated surface typed. Treat any affected JS/JSX as conversion work, not as a place to add more untyped code.

Required decisions:

- `src/pages/index.js` is removed after `src/app/page.tsx` and `HomeClient.tsx` reach parity. Do not convert this deleted route file first unless it is needed as a temporary stepping stone.
- Replace duplicated logic from `src/Utility/seasonaldata.js` with `src/server/seasonal/page-season.ts`. New App Router pages and server helpers must not import the old JS helper.
- Replace duplicated logic from `src/Utility/seasonal_carousel/extended_season_data.js` with the typed season-window helper. Update cron warm-up to use the typed helper too.
- Replace `src/Utility/seasonal_carousel/onlythisseason.js` and `src/Utility/seasonal_carousel/onlythiseason_list.js` usage in this migrated surface with typed helpers in `src/server/seasonal/mal-season-pages.ts`.
- If image fallback changes touch `src/ComponentsSelf/animecard.jsx`, convert it to `src/ComponentsSelf/animecard.tsx`.
- If seasonal carousel null/fallback handling touches `src/ComponentsSelf/carousel/seasonal_card.jsx`, convert it to `src/ComponentsSelf/carousel/seasonal_card.tsx`.
- If any skeleton or card component is touched while migrating these routes, convert that specific file to `.tsx` as part of the same edit.

Conversion rules:

- Use explicit prop interfaces for converted components.
- Prefer shared domain types from `src/types/**` or the new `src/server/seasonal/**` helpers instead of `any`.
- Keep browser-only converted components marked with `"use client"` when they use hooks, DOM APIs, event handlers, or interactive UI primitives.
- Update imports after renames and run `rg -n "from ['\"].*\\.jsx?['\"]|require\\(" src/app src/ComponentsSelf src/server` to catch stale extension-specific imports.
- Do not convert unrelated legacy JS route families in this task. Task 07 and Task 08 own detail, tracking, mylist, and search result route files.

## Shared Data Contracts

### Season Window

Create a typed, testable season helper instead of duplicating `seasonaldata()` logic again.

Create:

- `src/server/seasonal/page-season.ts`

Required exports:

```ts
export const ANIME_SEASONS = ["winter", "spring", "summer", "fall"] as const;
export type AnimeSeason = typeof ANIME_SEASONS[number];

export type SeasonWindow = {
  current_month: number;
  current_year: number;
  current_season: AnimeSeason;
  past_year: number;
  past_season: AnimeSeason;
  upcoming_year: number;
  upcoming_season: AnimeSeason;
};

export function getSeasonWindow(now?: Date): SeasonWindow;
export function getSeasonCarouselWindow(now?: Date): Array<{ season: AnimeSeason; year: number }>;
export function generateSeasonStaticParams(now?: Date): Array<{ season: AnimeSeason; year: string }>;
```

Rules:

- January to March is `winter`.
- April to June is `spring`.
- July to September is `summer`.
- October to December is `fall`.
- Previous season from `winter` is `fall` of the previous year.
- Upcoming season from `fall` is `winter` of the next year.
- Preserve the current seasonal carousel window:
  - the existing helper currently returns five historical seasons despite being named `past_4_season`,
  - plus previous, current, upcoming,
  - plus one future season.
- `generateSeasonStaticParams()` must return string years because App Router route params are strings.
- Tests must inject dates; do not make tests depend on the current real date.

### MAL Seasonal List Data

Create:

- `src/server/seasonal/mal-season-pages.ts`

Required constants:

```ts
export const MAL_SEASON_FIELDS =
  "main_picture,status,start_season,num_episodes,title,alternative_titles,mean,num_scoring_users,popularity,genres";
export const MAL_SEASON_LIMIT = 500;
export const MAL_SEASON_OFFSET = 0;
```

Required exports:

```ts
export type MalSeasonNode = {
  id: number;
  main_picture?: { large?: string; medium?: string };
  status?: string;
  start_season?: { season?: AnimeSeason; year?: number };
  num_episodes?: number;
  title?: string;
  alternative_titles?: { en?: string };
  mean?: number | null;
  num_scoring_users?: number | null;
  popularity?: number | null;
  genres?: Array<{ id?: number; name?: string }>;
};

export type MalSeasonItem = { node: MalSeasonNode };

export async function fetchCachedMalSeason(input: {
  year: number | string;
  season: AnimeSeason;
  sort?: "anime_score" | "descending";
  revalidate?: number;
}): Promise<MalSeasonItem[]>;

export function normalizeMalSeasonResponse(raw: unknown): MalSeasonItem[];
export function filterSeasonStart(items: MalSeasonItem[], season: AnimeSeason, year: number): MalSeasonItem[];
export function pickSeasonRepresentative(items: MalSeasonItem[], season: AnimeSeason, year: number): MalSeasonItem | null;
```

Fetch behavior:

- Build `https://api.myanimelist.net/v2/anime/season/{year}/{season}` with `URL` and `URLSearchParams`.
- Use `sort=descending` for the four existing list pages. The current Pages Router list pages use `sort=descending`; the API proxy uses `anime_score`, but this task preserves the page behavior.
- Use `limit=500`, `offset=0`, and `MAL_SEASON_FIELDS`.
- Send `X-MAL-CLIENT-ID` from `process.env.Client_ID` through `getRequiredEnv("Client_ID")`.
- Use `next: { revalidate: SEASONAL_PAGE_REVALIDATE_SECONDS }`.
- Never use the public `/api/seasonal` route for Server Component page data.

Normalization behavior:

- If upstream JSON is missing `data`, return `[]`.
- If an item is missing `node` or `node.id`, drop it.
- Remove duplicate `node.id` values while preserving first occurrence order.
- Keep optional fields optional. Rendering code must handle missing image, title, status, season, score, member count, popularity, and genres.
- `filterSeasonStart()` must check `node.start_season.season` and `node.start_season.year`; guard missing `start_season`.
- `pickSeasonRepresentative()` returns the first item that started in that exact season/year, or `null`.

### Homepage Jikan Season Strips

The homepage currently uses Jikan for the three horizontal strips:

- current season,
- previous season,
- upcoming season.

Required exports in `src/server/seasonal/home-page-data.ts`:

```ts
export type HomeSeasonCard = {
  status?: string;
  mal_id: number;
  images: { webp: { large_image_url?: string } };
  year?: number;
  title: string;
  score?: number | null;
  title_english?: string | null;
};

export type HomeSeasonResult = {
  querydata: HomeSeasonCard[];
  isloading: boolean;
  error: boolean;
};

export async function fetchJikanSeasonCards(season: AnimeSeason, year: number): Promise<HomeSeasonResult>;
```

Behavior:

- Fetch `https://api.jikan.moe/v4/seasons/{year}/{season}`.
- Use `next: { revalidate: SEASONAL_PAGE_REVALIDATE_SECONDS }`.
- Take the first 24 items after removing duplicate `mal_id` values.
- Project only the fields consumed by `ThisSeasonSec`, `LastSeason`, and `UpcomingSec`.
- If upstream fails, return `{ querydata: [], isloading: true, error: true }` to preserve the old section-level fallback behavior.
- Do not let malformed individual items crash the whole homepage. Drop malformed items.

### Homepage AniList Spotlight

Required export:

```ts
export type AniListSpotlightItem = {
  bannerImage?: string | null;
  idMal?: number | string | null;
  genres?: string[];
  title?: { english?: string | null; romaji?: string | null };
};

export async function fetchAniListSpotlight(window: SeasonWindow): Promise<{
  querydata: AniListSpotlightItem[];
  isloading: boolean;
  error: boolean;
}>;
```

Behavior:

- POST to `https://graphql.anilist.co`.
- Keep the current GraphQL fields:
  - `bannerImage`
  - `idMal`
  - `genres`
  - `title { english romaji }`
- Use current season uppercased, current year, `perPage: 10`, `page: 1`, `sort: "POPULARITY_DESC"`, `isAdult: false`.
- Use `next: { revalidate: SEASONAL_PAGE_REVALIDATE_SECONDS }`.
- Drop entries with no `idMal`.
- Keep entries with missing `bannerImage`; `CarouselDemo` already filters them out visually. Tests must cover this so the server helper and client stay aligned.
- Treat an empty normalized spotlight list as a critical homepage failure as described in the Data Freshness Contract.

### Homepage Seasonal Carousel

Required export:

```ts
export type HomeSeasonCarouselData = {
  season_anime: Array<MalSeasonItem | null>;
  seasonal_data: Array<{ season: AnimeSeason; year: number }>;
};

export async function fetchHomeSeasonCarousel(window?: SeasonWindow): Promise<HomeSeasonCarouselData>;
```

Behavior:

- Use `getSeasonCarouselWindow()` to build the same season list used by the current homepage seasonal carousel.
- For each season/year, fetch MAL seasonal data with cached static-page fetch options.
- Select one representative anime that started in that exact season/year.
- Keep `season_anime` aligned by index with `seasonal_data`.
- Use `null` when a season has no representative instead of returning `undefined`.
- Update `Season_carousel` or the wrapper to skip `null` entries without shifting `seasonal_data` out of alignment.
- Do not let one failed historical season fetch break the entire homepage. Return `null` for that season and continue.

## App Router Page Contracts

### `src/app/page.tsx`

Responsibilities:

- Be a Server Component.
- Export homepage `metadata` instead of using `next/head`.
- Fetch all homepage data server-side using `fetchHomePageData()`.
- Render a client boundary such as `HomeClient`.
- Pass only serializable data to the client.

Use this structure:

```tsx
import type { Metadata } from "next";
import HomeClient from "./_components/HomeClient";
import { fetchHomePageData, SEASONAL_PAGE_REVALIDATE_SECONDS } from "@/server/seasonal/home-page-data";

export const revalidate = SEASONAL_PAGE_REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: "AniJikan",
  description: "Explore trending and currently airing anime with AnimeTracker. Track your watchlist, manage your progress, and stay updated with the latest anime releases.",
  keywords: ["anime tracker", "anime discovery", "anime watchlist", "track anime episodes", "anime list manager", "trending anime", "currently airing anime"],
  openGraph: {
    title: "AnimeTracker - Discover & Track Your Favorite Anime",
    description: "A simple and clean platform to discover anime and manage your anime watchlist. Stay on top of trending and new anime releases.",
    url: "https://anime-tracker-next-js.vercel.app/",
    type: "website",
  },
};

export default async function Page() {
  const data = await fetchHomePageData();
  return <HomeClient {...data} />;
}
```

Notes:

- Put `HomeClient` at `src/app/_components/HomeClient.tsx`.
- Keep root shell concerns in `src/app/layout.tsx` and `src/app/providers.tsx`; do not recreate `_app.js` behavior in the page.
- Do not import `Nav`, `CarouselDemo`, `ThisSeasonSec`, `LastSeason`, `UpcomingSec`, or `Season_carousel` directly into the Server Component if those components rely on hooks or browser-only UI primitives. Import them through `HomeClient`.

### `HomeClient`

Responsibilities:

- Mark with `"use client"`.
- Render the current homepage layout:
  - `Nav`
  - spotlight carousel
  - current season strip
  - last season strip
  - upcoming season strip
  - season carousel
- Own browser bootstrapping that currently lives in `src/pages/index.js`.

Required browser behavior:

- On mount, call `fetchAuthSession()` and `isSessionExpiringSoon()`.
- If there is a refresh token and the session is expiring soon, call `tokenrefresh()`.
- If token refresh fails, reset these localStorage keys to empty arrays:
  - `Watching`
  - `Completed`
  - `OnHold`
  - `Dropped`
  - `PlanToWatch`
- After a successful or failed token-refresh attempt that previously called `router.reload()`, use `window.location.reload()` to preserve full reload semantics.
- Initialize missing watchlist keys as serialized empty maps:
  - `JSON.stringify([...new Map()])`
- Guard localStorage access with `try/catch` or a safe storage helper. Missing, blocked, or corrupted storage must not crash hydration.
- Set the same session keys on home entry:
  - `morescroll = "0"`
  - remove `animedatasearch`
  - remove `lastupdatetimesearch`
  - `activetab = "Plan To Watch"`
  - `scrollY = "0"`
  - `slicearr = "30"`
- Preserve desktop search behavior. Current empty home search navigates to `/search/`; keep that behavior and add `src/app/search/page.tsx` redirecting to `/search/NA`.
- Prefer React `onClick` and `onKeyDown` handlers over manual `addEventListener` on refs if touching `Nav` is low risk. If keeping the existing ref pattern, ensure listeners are cleaned up and refs are null-checked.

### `src/app/search/page.tsx`

Implement this redirect:

```tsx
import { redirect } from "next/navigation";

export default function SearchIndexPage() {
  redirect("/search/NA");
}
```

The redirect path is smaller and preserves the old broken target with a useful destination.

### Static List Pages

Create a small Server Component wrapper per route:

- `src/app/morethiseseason/page.tsx`
- `src/app/morelastseason/page.tsx`
- `src/app/moreupcoming/page.tsx`

Responsibilities:

- Export `revalidate = SEASONAL_PAGE_REVALIDATE_SECONDS`.
- Fetch the correct season using `getSeasonWindow()`.
- Pass normalized list data to a shared client component.
- Pass the correct detail link prefix and title.

Expected mapping:

| Route | Season source | Title | Detail href prefix |
| --- | --- | --- | --- |
| `/morethiseseason` | `current_season`, `current_year` | `This Season` | `/morethiseseason` |
| `/morelastseason` | `past_season`, `past_year` | `Last Season` | `/morelastseason` |
| `/moreupcoming` | `upcoming_season`, `upcoming_year` | `Upcoming Season` | `/moreupcoming` |

Pass the `season` and `year` props to `Morenavbar` for all three static list pages, including last season. This removes the current hidden special case.

### Dynamic Season Page

Create:

- `src/app/seasons/[season]/[year]/page.tsx`

Responsibilities:

- Export `revalidate = SEASONAL_PAGE_REVALIDATE_SECONDS`.
- Export `dynamicParams = true` to preserve `fallback: 'blocking'` behavior.
- Export `generateStaticParams()` using `generateSeasonStaticParams()`.
- Validate route params before fetching.
- Call `notFound()` for invalid `season` or invalid `year`.
- Fetch and render the list for any valid season/year, including valid routes not returned by `generateStaticParams()`.

Param typing:

- This project uses Next 16. Type route props with promise-based params and await them:

```ts
type SeasonPageProps = {
  params: Promise<{ season: string; year: string }>;
};

export default async function Page({ params }: SeasonPageProps) {
  const { season, year } = await params;
}
```

- `generateStaticParams()` still returns plain objects:

```ts
export function generateStaticParams() {
  return generateSeasonStaticParams();
}
```

Validation rules:

- Valid seasons: `winter`, `spring`, `summer`, `fall`.
- Valid year: exactly four digits.
- Keep the broad current year range unless a separate task adds year limits.
- Normalize season to lowercase before validation if the user enters uppercase.
- Do not call MAL for invalid params.

Display title:

- Format as `Spring, 2026`, `Winter, 2025`, etc.
- Use a shared title formatter and test it.

Detail links:

- Link items to `/seasons/{season}/{year}/{id}` exactly.

## Shared List Client Contract

Create:

- `src/app/_components/SeasonListClient.tsx`

Props:

```ts
type SeasonListClientProps = {
  title: string;
  initialItems: MalSeasonItem[];
  detailHrefPrefix: string;
  season?: AnimeSeason;
  year?: number;
};
```

Responsibilities:

- Mark with `"use client"`.
- Render `Morenavbar` and the same `Horizontalcard` grid used today.
- Keep all browser-only list behavior in this component.

Initial state:

- `activeItems` starts from route-scoped restored sorted data when valid, otherwise `initialItems`.
- `visibleCount` starts at 30 or the restored slice count when valid.
- `isLoading` remains false for server-rendered data.

Session storage:

- Existing keys are global:
  - `sorted_anime`
  - `sort_type`
  - `slicearr`
  - `scrollY`
- A global `sorted_anime` can leak between `/morethiseseason`, `/morelastseason`, `/moreupcoming`, and `/seasons/...`.
- Fix this in the new shared client without breaking back navigation:
  - Use route-scoped keys for new writes, for example `season-list:{pathname}:sorted_anime`, `season-list:{pathname}:sort_type`, and `season-list:{pathname}:slicearr`.
  - For compatibility, read the legacy global keys only if the stored list IDs are a subset of the current `initialItems` IDs; otherwise ignore and clear the legacy stale values.
  - Continue writing `scrollY` through the existing `useScrollSaver` helper.
- Tests must cover stale sorted data from a different list route.

Infinite scroll:

- Append 30 items when `window.innerHeight + window.scrollY >= document.body.offsetHeight - 200`.
- Compare `visibleCount` against `activeItems.length`, not only `initialItems.length`, so filtered or sorted lists behave correctly.
- Save the updated slice count after appending.
- Remove the scroll event listener on unmount.
- Do not depend on `router.isReady`; App Router pages do not need it.

Sorting:

- Keep the same visible options from `AnimeListSort`:
  - Top Score
  - Top Member
  - Completed
  - Airing
- Prefer extracting sort state handling into a small hook or passing a storage-key namespace into `AnimeListSort` rather than duplicating list page logic.
- Use the existing sort helpers. Any bug fix in those helpers must be covered by the sort tests listed below.
- Sorting must:
  - update the active list,
  - reset visible count to 30,
  - update sort storage,
  - reset saved scroll to 0,
  - scroll to top.

Watchlist badges:

- Read these localStorage maps after mount:
  - `PlanToWatch`
  - `Watching`
  - `Completed`
  - `OnHold`
  - `Dropped`
- Use a safe parser. Missing, empty, `null`, malformed JSON, object-shaped, or non-array storage values must produce an empty `Map`.
- An anime is marked as added when its `node.id` exists in any of the five maps.
- Do not mutate localStorage from the list page just to recover from corruption. Home bootstrapping can initialize missing keys; the list should only fall back safely.

Rendering each item:

- Skip items without `node.id`.
- `image`: `node.main_picture?.large ?? FALLBACK_POSTER_SRC`.
- `status`: format `node.status` by replacing underscores with spaces and capitalizing words; use `"Unknown"` when missing.
- `season`: use `node.start_season?.season` and `node.start_season?.year`; use `" "` when missing.
- `episodes`: `node.num_episodes ?? 0`.
- `title`: `node.alternative_titles?.en || node.title || "Untitled"`.
- `score`: pass `node.mean ?? null`.
- `users`: pass `node.num_scoring_users ?? 0`.
- `ranking`: pass `node.popularity ?? 0`.
- `genre`: pass `node.genres ?? []`.

Image fallback rules:

- Do not pass an empty string to `next/image`.
- Add a real local fallback image such as `public/placeholder.png`, or define `FALLBACK_POSTER_SRC` to an existing public asset.
- Update homepage card data and list card rendering so missing Jikan/MAL image URLs use the same fallback.
- Cover missing images in Playwright and unit tests because `next/image` failures can break rendering loudly.

Link targets:

- For static list routes, link to `${detailHrefPrefix}/${node.id}`.
- For dynamic season routes, pass `detailHrefPrefix` as `/seasons/${season}/${year}`.

Layout:

- Preserve the current classes:
  - outer black page container,
  - fixed top nav,
  - `top-18` grid offset,
  - `lg:grid lg:grid-cols-2`,
  - `pb-33 sm:pb-15` for mobile bottom padding.
- Do not introduce cards, redesign the nav, or change the grid density in this migration task.

## Component Boundary Notes

The App Router Server Components in this task must import only:

- server helpers,
- serializable types,
- Client Component boundaries.

Client-only imports that must stay behind `HomeClient` or `SeasonListClient`:

- `Nav`
- `CarouselDemo`
- `ThisSeasonSec`
- `LastSeason`
- `UpcomingSec`
- `Season_carousel`
- `Morenavbar`
- `AnimeListSort`
- `Horizontalcard`
- `useScrollSaver`
- `fetchAuthSession`
- `tokenrefresh`
- localStorage/sessionStorage helpers

Before finishing, run:

```powershell
rg -n "localStorage|sessionStorage|window\.|document\.|useEffect|useState|useRef|next/router" src/app src/server
```

Expected:

- `src/server/**` has no browser APIs or React client hooks.
- App route Server Components do not import browser APIs.
- Browser APIs appear only in files with `"use client"` or inside client-only helpers imported by Client Components.
- No new `next/router` imports.

## Implementation Sequence

1. Add or extend shared season/date helpers with injected-date tests.
2. Add cached static-page MAL fetch helpers separate from the no-store API proxy helper.
3. Add homepage data helpers for Jikan, AniList, and the seasonal carousel.
4. Add safe list storage helpers for watchlist maps and route-scoped list session state.
5. Convert affected JS/JSX components before or during their edits, especially `animecard.jsx` and `seasonal_card.jsx` if they are touched for fallback handling.
6. Add `HomeClient` and migrate homepage rendering behind `src/app/page.tsx`.
7. Add `src/app/search/page.tsx` redirect to `/search/NA`.
8. Add `SeasonListClient` and migrate `/morethiseseason`.
9. Verify `/morethiseseason` against baseline, then remove `src/pages/morethiseseason/index.tsx`.
10. Migrate `/morelastseason`, verify, then remove `src/pages/morelastseason/index.tsx`.
11. Migrate `/moreupcoming`, verify, then remove `src/pages/moreupcoming/index.tsx`.
12. Migrate `/seasons/[season]/[year]`, verify generated and fallback-valid routes, then remove `src/pages/seasons/[season]/[year]/index.tsx`.
13. Update `/api/cron/isr_warmUp/warmUp` to build seasonal warm-up routes from the new shared season helper so cron, static params, and the homepage carousel cannot drift.
14. Run all static checks, unit tests, build, and focused Playwright coverage.
15. Update this task with completion notes, compatibility notes, and verification results.

Do not delete the detail route families under each list route in this task.

## Deliverables

- `src/app/page.tsx`
- `src/app/_components/HomeClient.tsx`.
- `src/app/search/page.tsx` redirect.
- `src/app/morethiseseason/page.tsx`
- `src/app/morelastseason/page.tsx`
- `src/app/moreupcoming/page.tsx`
- `src/app/seasons/[season]/[year]/page.tsx`
- `src/app/_components/SeasonListClient.tsx`.
- Shared season/date helpers with tests.
- Cached static-page fetch helpers with tests.
- Safe storage/session helpers for list state with tests.
- A real fallback poster asset or a documented existing public asset used as `FALLBACK_POSTER_SRC`.
- Updated cron warm-up route that reuses the new season window helper.
- Converted TS/TSX versions of every JS/JSX file touched by this task.
- Removed Pages Router files for the migrated page routes after parity:
  - `src/pages/index.js`
  - `src/pages/morethiseseason/index.tsx`
  - `src/pages/morelastseason/index.tsx`
  - `src/pages/moreupcoming/index.tsx`
  - `src/pages/seasons/[season]/[year]/index.tsx`
- Compatibility notes for any intentionally changed cache, fallback, empty-search, or rendering behavior.

## Definition of Done

- `/`, `/morethiseseason`, `/morelastseason`, `/moreupcoming`, and `/seasons/[season]/[year]` render from `src/app`.
- The old Pages Router files for those exact public routes are removed after parity.
- Detail links from list pages still navigate to the existing detail pages.
- Static data refresh behavior matches the 12-hour baseline for successful data.
- Homepage critical carousel failures are not cached as empty successful pages for 12 hours.
- `generateStaticParams()` covers the same season window as the old `getStaticPaths()`.
- `dynamicParams = true` preserves valid unlisted season/year fallback generation.
- Invalid season/year params return 404 without calling MAL.
- Sorting, infinite scroll, storage badges, and scroll restore work on all four list route types.
- Stale `sorted_anime` session data from another route does not replace the current route's list.
- Local watchlist badges appear correctly after storage is seeded.
- Missing or corrupted storage does not crash hydration.
- Missing upstream fields do not crash rendering.
- Missing image URLs render a local fallback and never pass `""` to `next/image`.
- App Router shell parity is confirmed against `_app.js` for providers, PWA metadata, analytics, mobile nav, and persistent worker behavior.
- Cron warm-up still targets `/morethiseseason`, `/morelastseason`, `/moreupcoming`, and the same generated season routes after the migration.
- No affected JS/JSX file remains unconverted unless it was deleted as part of the route migration.
- No Server Component imports or executes `localStorage`, `sessionStorage`, `window`, or `document`.
- `rg -n "from ['\"]next/router['\"]" src/app src/server` returns no matches.
- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, and focused Playwright specs pass.

## Vitest Coverage Checklist

Season helpers:

- Current season for representative dates in January, March, April, June, July, September, October, and December.
- Previous season year boundary from winter to previous fall.
- Upcoming season year boundary from fall to next winter.
- `getSeasonCarouselWindow()` returns the exact ordered season/year list expected by the current seasonal carousel.
- `generateSeasonStaticParams()` returns string years and valid seasons only.
- Invalid `Date` input throws or returns a documented safe fallback.

Validation and formatting:

- Season param validation accepts only `winter`, `spring`, `summer`, and `fall`.
- Year validation accepts exactly four digits and rejects empty, decimal, negative, `20x6`, and mixed strings.
- Season title formatter returns `Spring, 2026`.
- Status formatter handles `currently_airing`, `finished_airing`, empty, and unknown status.

MAL static fetch helper:

- Builds the exact MAL seasonal URL with expected `sort`, `limit`, `offset`, and fields.
- Sends `X-MAL-CLIENT-ID`.
- Uses `next.revalidate = 43200` and does not use `cache: 'no-store'`.
- Missing `Client_ID` fails safely without exposing secret values.
- Upstream `429`, `500`, network failure, and malformed JSON are handled according to the documented route policy.
- Missing `data` normalizes to `[]`.
- Duplicate `node.id` values keep the first item.
- Items missing `node` or `node.id` are dropped.
- Missing optional fields survive normalization.
- `filterSeasonStart()` guards missing `start_season`.
- Payload size for `initialItems` is no worse than the current baseline warning. If `next build` emits new RSC or large-data warnings, document them and avoid passing unused fields to Client Components.

Homepage data helpers:

- Jikan helper deduplicates by `mal_id`, limits to 24, and projects the expected shape.
- Jikan helper returns the existing error shape on upstream failure.
- AniList helper posts expected GraphQL query and variables.
- AniList helper drops entries without `idMal`.
- AniList critical empty response follows the documented failure policy.
- Seasonal carousel keeps `season_anime` aligned with `seasonal_data` when one season has no representative.

Storage/session helpers:

- Missing watchlist key returns an empty `Map`.
- Empty string, `null`, malformed JSON, object JSON, and non-pair arrays return an empty `Map`.
- Valid serialized map arrays produce a `Map` with numeric and string IDs handled consistently.
- Route-scoped list state writes and reads sorted data, sort type, and slice count.
- Legacy global `sorted_anime` is ignored when IDs do not belong to the current route.
- Slice count rejects `NaN`, negative, zero, and unreasonably high values.

Sort helpers and list client:

- Top score sort handles missing `mean`.
- Top member sort handles missing `num_scoring_users`.
- Completed sort puts `finished_airing` items first and keeps remaining items.
- Airing sort puts `currently_airing` items first and keeps remaining items.
- Sort reset restores the server-provided default order and visible count 30.
- Infinite scroll increases visible count by 30 and stops at the active list length.
- Seeded watchlist storage marks matching anime as added.
- Corrupted storage renders without throwing.

## Playwright Coverage Checklist

Use route interception so tests do not depend on live Jikan, MAL, or AniList availability:

- `https://api.jikan.moe/v4/**`
- `https://graphql.anilist.co`
- `https://api.myanimelist.net/v2/**`

Homepage:

- `/` renders title `AniJikan`.
- Fixed top nav is visible.
- Spotlight carousel renders mocked AniList items.
- This Season, Last Season, Upcoming Season, and Seasons sections render.
- Empty desktop search lands on `/search/NA` through the redirect path.
- Normal desktop search sanitizes and encodes the search term.
- Home bootstrapping initializes all five localStorage watchlist keys when absent.
- No `window is not defined`, `localStorage is not defined`, Server Component boundary, or hydration errors appear in the console.

List routes:

- `/morethiseseason`, `/morelastseason`, `/moreupcoming`, and `/seasons/spring/2026` render mocked list items.
- Each list initially shows at most 30 cards.
- Scrolling near the bottom appends more cards.
- Sort menu changes visible order and resets scroll/slice state.
- Back button in `Morenavbar` clears list sort state and returns to `/`.
- Seeded localStorage marks an item as added on each list route.
- Corrupted localStorage fixtures do not crash the page.
- Missing image, status, season, score, member count, popularity, genres, and English title all render fallback UI without layout break.
- Missing image URL uses the local poster fallback and produces no `next/image` console error.
- Navigating from a list item to a detail page and using browser back restores scroll and visible slice count.
- Stale sorted session data from another list route is ignored.

Dynamic season route:

- A route returned by `generateStaticParams()`, such as `/seasons/spring/2026`, renders.
- A valid unlisted route renders on demand when `dynamicParams = true`.
- Invalid season, for example `/seasons/monsoon/2026`, returns 404 and does not call MAL.
- Invalid year, for example `/seasons/spring/20x6`, returns 404 and does not call MAL.

Failure paths:

- MAL list upstream `429` shows the intended empty/error state without crashing.
- Jikan homepage failure leaves the affected section in its intended loading/error state without breaking other sections.
- AniList critical failure follows the documented policy and is not silently cached as a successful empty page.

Cron warm-up:

- `/api/cron/isr_warmUp/warmUp` still warms the three static list routes.
- Cron dynamic season routes match `generateSeasonStaticParams()`.
- Cron warm-up succeeds against the migrated App Router pages with mocked upstream responses.

Responsive checks:

- Run list and homepage smoke coverage at desktop `1440x900`.
- Run the same core routes at a mobile viewport around `390x844`.
- Mobile bottom nav does not overlap the last row because bottom padding is preserved.
- Text in `Morenavbar` truncates cleanly for long season titles.

## Manual Baseline Comparison

Compare against existing screenshots before accepting visual parity:

- `migration_plan/baseline/screenshots/desktop/home.png`
- `migration_plan/baseline/screenshots/desktop/morethiseseason.png`
- `migration_plan/baseline/screenshots/desktop/morelastseason.png`
- `migration_plan/baseline/screenshots/desktop/moreupcoming.png`
- `migration_plan/baseline/screenshots/desktop/seasons-spring-2026.png`
- `migration_plan/baseline/screenshots/mobile/home.png`
- `migration_plan/baseline/screenshots/mobile/morethiseseason.png`
- `migration_plan/baseline/screenshots/mobile/morelastseason.png`
- `migration_plan/baseline/screenshots/mobile/moreupcoming.png`
- `migration_plan/baseline/screenshots/mobile/seasons-spring-2026.png`

Acceptable differences must be documented. Examples:

- Fixing the previous blank season display by rendering `node.start_season`.
- Redirecting `/search` to `/search/NA`.
- Skipping malformed upstream items that previously could crash.

## Verification Commands

Run before finishing:

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
npx playwright test tests/static-list-pages.spec.ts
rg -n 'next/router' src/app src/server
rg -n 'localStorage|sessionStorage|window\.|document\.' src/server src/app/page.tsx src/app/morethiseseason/page.tsx src/app/morelastseason/page.tsx src/app/moreupcoming/page.tsx src/app/seasons src/app/search/page.tsx
rg -n -g '!**/__tests__/**' 'no-store|force-no-store|force-dynamic' src/server/seasonal src/app/page.tsx src/app/morethiseseason/page.tsx src/app/morelastseason/page.tsx src/app/moreupcoming/page.tsx src/app/seasons src/app/search/page.tsx
rg -n '\.jsx|require\(' src/app src/ComponentsSelf src/server
Test-Path public/placeholder.svg
```

Expected:

- Lint, typecheck, Vitest, build, and focused Playwright tests pass.
- No App Router or server helper imports `next/router`.
- Browser APIs are absent from Server Components and server helpers.
- Static page helpers do not use no-store caching.
- No migrated App Router/server/component imports point at old `.js` or `.jsx` files touched by this task.
- The fallback poster asset check passes, or the implementation documents another existing local fallback asset and tests it.
- Build output lists `/`, `/morethiseseason`, `/morelastseason`, `/moreupcoming`, `/search`, and `/seasons/[season]/[year]` under App Router.

## Edge Cases To Watch

- Next.js fetch defaults differ between versions; always set static page `next.revalidate` explicitly.
- Reusing the no-store API proxy helper would make migrated list pages dynamic.
- `generateStaticParams()` returns strings, while helper logic may use numeric years.
- App Router route `params` are promise-typed in this plan; await them in the page component.
- `dynamicParams = true` is needed to preserve `fallback: 'blocking'`.
- Invalid params must not make an upstream MAL call.
- The server timezone can affect current season around month boundaries. Tests should inject dates; production should use the deployment server's `new Date()` unless a separate product decision changes timezone handling.
- The existing seasonal carousel helper name says four past seasons but returns five; preserve or intentionally document the change.
- MAL may return no `data`, duplicate IDs, missing `node`, or missing optional fields.
- MAL uses `start_season`; older rendering code tried to read `node.season` and `node.year`.
- `onlythis_season` currently assumes `node.start_season` exists; new helpers must guard it.
- The previous `Horizontalcard` fallback referenced `/placeholder.png`, but that file was absent at planning time. Keep the implementation aligned to the documented fallback asset.
- Homepage `animecard.jsx` previously passed `props.link` directly to `next/image`; missing Jikan images need the same fallback.
- Jikan may return duplicate `mal_id` values or malformed items.
- AniList may return media with no `idMal` or no `bannerImage`.
- Empty AniList spotlight must not be cached as a successful empty homepage for 12 hours.
- `localStorage.getItem()` and `sessionStorage.getItem()` can throw or return corrupted data.
- `new Map(JSON.parse(null))` and object-shaped JSON can crash if not guarded.
- Global legacy `sorted_anime` can leak from one list route into another.
- Scroll restoration can run before enough list items have mounted; retry restore after visible count and active list update.
- Infinite scroll should compare against the sorted/active list length.
- Existing sort helpers assume MAL item shape with `node.mean`, `node.num_scoring_users`, and `node.status`.
- Empty search currently targets `/search/`; preserve it with the `/search` redirect.
- Initial App Router build can fail if critical upstream fetches throw before an ISR cache exists. Keep this intentional fail-fast policy or revise it explicitly before implementation.
- Existing build warnings about large page data may reappear as RSC payload concerns; do not expand client props beyond fields that are rendered.
- Cron warm-up currently imports older `seasonaldata()` and `extended_season_data()` helpers. Switch it to the new typed helper to avoid route drift.
- Deleting `src/pages/index.js` before `/` fully works can temporarily break the app shell.
- Leaving both Pages Router and App Router files for the same public route can create route conflicts or confusing build output.
- Detail links must keep pointing to the old detail route files until Task 07 migrates them.

## Implementation Completion Status

### Completed Implementation & Rationale

1. **Static Segment Revalidation (`revalidate = 43200`)**:
   - *Rationale*: Next.js 16 requires static page options to be exported as raw literal constants so the compiler can parse them at build time. We configured all page files with `export const revalidate = 43200;` to guarantee static compilation.
   - *Failure Boundary*: The AniList spotlight query throws on failure or empty response during server fetches, which prevents Next.js from caching an empty carousel for 12 hours.

2. **TypeScript Migration**:
   - *Rationale*: To resolve technical debt, we fully converted [animecard.jsx](file:///c:/AnimeTracker-Next-js/src/ComponentsSelf/animecard.jsx), [seasonal_card.jsx](file:///c:/AnimeTracker-Next-js/src/ComponentsSelf/carousel/seasonal_card.jsx), and the homepage dependency [grid-pattern.jsx](file:///c:/AnimeTracker-Next-js/src/components/magicui/grid-pattern.jsx) to TypeScript. Props are typed with compiler interfaces, and poster fallbacks now point at the documented [placeholder.svg](file:///c:/AnimeTracker-Next-js/public/placeholder.svg) asset.

3. **Route-Scoped Session Storage**:
   - *Rationale*: To prevent sorting and listing state leak (crosstalk) across different seasonal pages (e.g. from `/morethiseseason` to `/morelastseason`), state variables were partitioned under scoped keys (e.g. `season-list:${pathname}:sort_type`). Client-only storage parsing lives in [src/lib/season-list-storage.ts](file:///c:/AnimeTracker-Next-js/src/lib/season-list-storage.ts), legacy globals are parsed defensively, and stale sorted lists are rejected unless their IDs belong to the current route payload.

4. **Isomorphic Cron Warm-up**:
   - *Rationale*: Updated the ISR warm-up route handler to consume the exact same date and season calculation functions as the pages, avoiding page caching drift.

5. **MAL Page Failure Fallback**:
   - *Rationale*: The old Pages Router `getStaticProps` implementation caught MAL failures and rendered an empty list. Static list App Router pages now use `fetchCachedMalSeasonOrEmpty()` so 429/500/network/parse failures do not turn the list route into a hard error during ISR.

### Implemented Files

- **Routes**:
  - [src/app/page.tsx](file:///c:/AnimeTracker-Next-js/src/app/page.tsx) (Homepage)
  - [src/app/morethiseseason/page.tsx](file:///c:/AnimeTracker-Next-js/src/app/morethiseseason/page.tsx)
  - [src/app/morelastseason/page.tsx](file:///c:/AnimeTracker-Next-js/src/app/morelastseason/page.tsx)
  - [src/app/moreupcoming/page.tsx](file:///c:/AnimeTracker-Next-js/src/app/moreupcoming/page.tsx)
  - [src/app/seasons/[season]/[year]/page.tsx](file:///c:/AnimeTracker-Next-js/src/app/seasons/[season]/[year]/page.tsx)
  - [src/app/search/page.tsx](file:///c:/AnimeTracker-Next-js/src/app/search/page.tsx) (Index Redirect redirecting `/search` to `/search/NA`)
- **Client Shells**:
  - [src/app/_components/HomeClient.tsx](file:///c:/AnimeTracker-Next-js/src/app/_components/HomeClient.tsx)
  - [src/app/_components/SeasonListClient.tsx](file:///c:/AnimeTracker-Next-js/src/app/_components/SeasonListClient.tsx)
- **Helpers**:
  - [src/server/seasonal/page-season.ts](file:///c:/AnimeTracker-Next-js/src/server/seasonal/page-season.ts)
  - [src/server/seasonal/mal-season-pages.ts](file:///c:/AnimeTracker-Next-js/src/server/seasonal/mal-season-pages.ts)
  - [src/server/seasonal/home-page-data.ts](file:///c:/AnimeTracker-Next-js/src/server/seasonal/home-page-data.ts)
  - [src/lib/season-list-storage.ts](file:///c:/AnimeTracker-Next-js/src/lib/season-list-storage.ts)
- **Components**:
  - [src/ComponentsSelf/animecard.tsx](file:///c:/AnimeTracker-Next-js/src/ComponentsSelf/animecard.tsx) (Migrated to TSX)
  - [src/ComponentsSelf/carousel/seasonal_card.tsx](file:///c:/AnimeTracker-Next-js/src/ComponentsSelf/carousel/seasonal_card.tsx) (Migrated to TSX)
  - [src/components/magicui/grid-pattern.tsx](file:///c:/AnimeTracker-Next-js/src/components/magicui/grid-pattern.tsx) (Migrated to TSX)
- **Assets**:
  - [public/placeholder.svg](file:///c:/AnimeTracker-Next-js/public/placeholder.svg)
- **Tests**:
  - [tests/static-list-pages.spec.ts](file:///c:/AnimeTracker-Next-js/tests/static-list-pages.spec.ts) (E2E Integration spec)
  - [src/lib/__tests__/season-list-storage.test.ts](file:///c:/AnimeTracker-Next-js/src/lib/__tests__/season-list-storage.test.ts)
  - [src/server/seasonal/__tests__/mal-season-pages.test.ts](file:///c:/AnimeTracker-Next-js/src/server/seasonal/__tests__/mal-season-pages.test.ts)

### Removed Files

- `src/pages/index.js`
- `src/pages/morethiseseason/index.tsx`
- `src/pages/morelastseason/index.tsx`
- `src/pages/moreupcoming/index.tsx`
- `src/pages/seasons/[season]/[year]/index.tsx`
- `src/ComponentsSelf/animecard.jsx`
- `src/ComponentsSelf/carousel/seasonal_card.jsx`
- `src/components/magicui/grid-pattern.jsx`

### Verification Results

We verified compiling, typing, and visual/interactive logic:

```powershell
# 1. Run ESLint checks
npm run lint

# 2. Run TypeScript checks
npm run typecheck

# 3. Run all unit tests
npm run test

# 4. Run production build compilation
npm run build

# 5. Run focused E2E Playwright integration tests
npx playwright test tests/static-list-pages.spec.ts
```

**Results**:
- **Linting**: ESLint checks pass with 0 errors. Remaining warnings are pre-existing legacy Pages Router/image warnings outside this task's static list route migration.
- **Typecheck**: `tsc --noEmit` compiles completely with 0 errors.
- **Unit Tests**: All **138 Vitest tests** pass, including MAL failure fallback and stale route-scoped storage rejection.
- **Production Build**: Successfully compiled the Next.js bundle, with `/`, `/morelastseason`, `/morethiseseason`, `/moreupcoming`, `/search`, and `/seasons/[season]/[year]` generated as static/SSG App Router routes with a 12-hour revalidate lifespan.
- **E2E Tests**: The focused static-list Playwright spec passes for both Desktop Chromium and Mobile Chrome viewports (**6/6**), including homepage bootstrapping, `/morethiseseason` interactions, sibling list route shells, dynamic season route shell, and invalid season 404 handling.
- **Browser API Check**: Verified that no server helpers or server routes reference `localStorage`, `sessionStorage`, `document`, browser `window`, or `next/router`. Browser API references are isolated inside client components/helpers.
