# Task 07: Anime Detail, Relation, and Tracking Route Families

## Purpose

Migrate the duplicated anime detail, relation, and tracking route families from `src/pages` to the App Router while preserving every public URL, route-specific navigation, trailer rendering, rich detail metadata, local watchlist behavior, and authenticated MAL sync behavior.

This task uses a deliberate hybrid data strategy:

- **Detail and relation display pages use Jikan** because the UI needs trailer embeds and richer public metadata.
- **Tracking pages use MAL API** because localStorage and authenticated sync should store real MAL-compatible anime list items, not Jikan data reshaped into fake MAL data.

A junior engineer should be able to follow this plan route by route without guessing which API to call, which anime ID to fetch, what data shape to store, or when old Pages Router files can be removed.

## Current Baseline

- App Router shell, list routes, route handlers, routing helpers, and shared client-boundary fixes already exist from earlier tasks.
- The detail/tracking route families still live under `src/pages/**` and still import `next/router`.
- Existing detail pages fetch Jikan `/v4/anime/:id/full` and render poster, status, season/year, score, synopsis, trailer, metadata, relations, and add-to-watchlist CTA.
- Existing relation detail pages correctly fetch `relation_id` for the displayed anime, while preserving source `mal_id` in the URL.
- Existing tracking pages fetch Jikan `/v4/anime/:id/full`, then call `jikantomalformat` to fake a MAL-like localStorage shape.
- Existing authenticated save/delete already calls MAL proxy endpoints:
  - `/api/users/data/save_anime`
  - `/api/users/data/delete_anime`
- Existing App Router MAL client already supports some MAL flows in `src/server/mal/client.ts`, but public detail tracking fetches need to be added or expanded.

## Data Source Decision

### Detail And Relation Pages

Use Jikan for display pages:

- `/Anime/[mal_id]`
- `/Anime/[mal_id]/relation/[relation_id]`
- equivalent detail/relation routes under `morethiseseason`, `morelastseason`, `moreupcoming`, `search`, `mylist`, and `seasons`

Jikan is required here because MAL API does not provide trailer embed URLs. Jikan also provides several rich display fields the current UI expects, including licensors/producers/themes/demographics/favorites depending on endpoint response.

### Tracking Pages

Use MAL for tracking pages:

- `/Anime/[mal_id]/tracking`
- `/Anime/[mal_id]/relation/[relation_id]/tracking`
- equivalent tracking routes under `morethiseseason`, `morelastseason`, `moreupcoming`, `search`, `mylist`, and `seasons`

Tracking must not fetch Jikan and must not call `jikantomalformat`.

The tracking page should fetch MAL anime detail by the target anime ID and save a real MAL-compatible list item shape to localStorage. This makes local watchlist data match authenticated MAL list data and removes the risky Jikan-to-MAL adapter.

### Hard Rule

Never save Jikan-shaped data to watchlist localStorage.

Jikan is display-only. MAL is tracking/storage/sync-only.

## Non-Goals

- Do not redesign the detail or tracking UI.
- Do not remove trailer UI.
- Do not change public route names, casing, or path segment order.
- Do not redesign the localStorage watchlist key names.
- Do not change MAL proxy endpoint URLs or auth semantics.
- Do not migrate unrelated `/mylist`, login/logout, user profile, worker sync, or testbed pages here unless a compatibility change is required for detail/tracking routes.
- Do not remove a Pages Router route until the matching App Router route has automated coverage and manual smoke parity.

## Route Matrix

Create these App Router routes. Each route should be a thin wrapper that passes typed params and route-family context into shared components.

| Public route | App Router file | Detail display API | Tracking API target | Source context |
| --- | --- | --- | --- | --- |
| `/Anime/[mal_id]` | `src/app/Anime/[mal_id]/page.tsx` | Jikan `mal_id` | n/a | root anime detail |
| `/Anime/[mal_id]/tracking` | `src/app/Anime/[mal_id]/tracking/page.tsx` | n/a | MAL `mal_id` | root anime detail |
| `/Anime/[mal_id]/relation/[relation_id]` | `src/app/Anime/[mal_id]/relation/[relation_id]/page.tsx` | Jikan `relation_id` | n/a | source `mal_id` |
| `/Anime/[mal_id]/relation/[relation_id]/tracking` | `src/app/Anime/[mal_id]/relation/[relation_id]/tracking/page.tsx` | n/a | MAL `relation_id` | source `mal_id` |
| `/morethiseseason/[mal_id]` | `src/app/morethiseseason/[mal_id]/page.tsx` | Jikan `mal_id` | n/a | `/morethiseseason` |
| `/morethiseseason/[mal_id]/tracking` | `src/app/morethiseseason/[mal_id]/tracking/page.tsx` | n/a | MAL `mal_id` | `/morethiseseason` |
| `/morethiseseason/[mal_id]/relation/[relation_id]` | `src/app/morethiseseason/[mal_id]/relation/[relation_id]/page.tsx` | Jikan `relation_id` | n/a | source `mal_id`, `/morethiseseason` |
| `/morethiseseason/[mal_id]/relation/[relation_id]/tracking` | `src/app/morethiseseason/[mal_id]/relation/[relation_id]/tracking/page.tsx` | n/a | MAL `relation_id` | source `mal_id`, `/morethiseseason` |
| `/morelastseason/[mal_id]` | `src/app/morelastseason/[mal_id]/page.tsx` | Jikan `mal_id` | n/a | `/morelastseason` |
| `/morelastseason/[mal_id]/tracking` | `src/app/morelastseason/[mal_id]/tracking/page.tsx` | n/a | MAL `mal_id` | `/morelastseason` |
| `/morelastseason/[mal_id]/relation/[relation_id]` | `src/app/morelastseason/[mal_id]/relation/[relation_id]/page.tsx` | Jikan `relation_id` | n/a | source `mal_id`, `/morelastseason` |
| `/morelastseason/[mal_id]/relation/[relation_id]/tracking` | `src/app/morelastseason/[mal_id]/relation/[relation_id]/tracking/page.tsx` | n/a | MAL `relation_id` | source `mal_id`, `/morelastseason` |
| `/moreupcoming/[mal_id]` | `src/app/moreupcoming/[mal_id]/page.tsx` | Jikan `mal_id` | n/a | `/moreupcoming` |
| `/moreupcoming/[mal_id]/tracking` | `src/app/moreupcoming/[mal_id]/tracking/page.tsx` | n/a | MAL `mal_id` | `/moreupcoming` |
| `/moreupcoming/[mal_id]/relation/[relation_id]` | `src/app/moreupcoming/[mal_id]/relation/[relation_id]/page.tsx` | Jikan `relation_id` | n/a | source `mal_id`, `/moreupcoming` |
| `/moreupcoming/[mal_id]/relation/[relation_id]/tracking` | `src/app/moreupcoming/[mal_id]/relation/[relation_id]/tracking/page.tsx` | n/a | MAL `relation_id` | source `mal_id`, `/moreupcoming` |
| `/search/[title]/[mal_id]` | `src/app/search/[title]/[mal_id]/page.tsx` | Jikan `mal_id` | n/a | `/search/[title]` |
| `/search/[title]/[mal_id]/tracking` | `src/app/search/[title]/[mal_id]/tracking/page.tsx` | n/a | MAL `mal_id` | `/search/[title]` |
| `/search/[title]/[mal_id]/relation/[relation_id]` | `src/app/search/[title]/[mal_id]/relation/[relation_id]/page.tsx` | Jikan `relation_id` | n/a | source `mal_id`, `/search/[title]` |
| `/search/[title]/[mal_id]/relation/[relation_id]/tracking` | `src/app/search/[title]/[mal_id]/relation/[relation_id]/tracking/page.tsx` | n/a | MAL `relation_id` | source `mal_id`, `/search/[title]` |
| `/mylist/[mylist_tab]/[mal_id]` | `src/app/mylist/[mylist_tab]/[mal_id]/page.tsx` | Jikan `mal_id` | n/a | `/mylist`, selected tab |
| `/mylist/[mylist_tab]/[mal_id]/tracking` | `src/app/mylist/[mylist_tab]/[mal_id]/tracking/page.tsx` | n/a | MAL `mal_id` | `/mylist`, selected tab |
| `/mylist/[mylist_tab]/[mal_id]/relation/[relation_id]` | `src/app/mylist/[mylist_tab]/[mal_id]/relation/[relation_id]/page.tsx` | Jikan `relation_id` | n/a | source `mal_id`, selected tab |
| `/mylist/[mylist_tab]/[mal_id]/relation/[relation_id]/tracking` | `src/app/mylist/[mylist_tab]/[mal_id]/relation/[relation_id]/tracking/page.tsx` | n/a | MAL `relation_id` | source `mal_id`, selected tab |
| `/seasons/[season]/[year]/[mal_id]` | `src/app/seasons/[season]/[year]/[mal_id]/page.tsx` | Jikan `mal_id` | n/a | `/seasons/[season]/[year]` |
| `/seasons/[season]/[year]/[mal_id]/tracking` | `src/app/seasons/[season]/[year]/[mal_id]/tracking/page.tsx` | n/a | MAL `mal_id` | `/seasons/[season]/[year]` |
| `/seasons/[season]/[year]/[mal_id]/relation/[relation_id]` | `src/app/seasons/[season]/[year]/[mal_id]/relation/[relation_id]/page.tsx` | Jikan `relation_id` | n/a | source `mal_id`, season/year |
| `/seasons/[season]/[year]/[mal_id]/relation/[relation_id]/tracking` | `src/app/seasons/[season]/[year]/[mal_id]/relation/[relation_id]/tracking/page.tsx` | n/a | MAL `relation_id` | source `mal_id`, season/year |

## Required Architecture

### Shared Route Context

Create a typed route-context module, preferably `src/lib/routing/detail-route-context.ts`.

Required exports:

```ts
export type DetailRouteFamily =
  | "anime"
  | "morethiseseason"
  | "morelastseason"
  | "moreupcoming"
  | "search"
  | "mylist"
  | "seasons";

export type DetailRouteContext = {
  family: DetailRouteFamily;
  pathname: string;
  sourceAnimeId: number;
  targetAnimeId: number;
  relationAnimeId?: number;
  title?: string;
  mylistTab?: string;
  season?: string;
  year?: number;
  isRelationRoute: boolean;
  isTrackingRoute: boolean;
};
```

Rules:

- `sourceAnimeId` is always the `[mal_id]` route param.
- `targetAnimeId` is `relation_id` for relation routes and `mal_id` otherwise.
- Detail pages fetch Jikan using `targetAnimeId`.
- Tracking pages fetch MAL using `targetAnimeId`.
- `relationAnimeId` is only set for relation routes.
- Reject missing, non-numeric, zero, negative, decimal, `NaN`, or infinite `mal_id`, `relation_id`, and `year`.
- Preserve encoded search titles. Use decoded text only for display labels, not route construction unless re-encoding with existing helpers.
- `mylist_tab` must remain a path segment. Do not silently normalize it to a different tab name during navigation.

Add helpers for:

- parsing params into `DetailRouteContext`;
- building the current public pathname from context;
- building detail back hrefs;
- building tracking hrefs;
- building tracking return hrefs;
- building relation hrefs from current context;
- building `/ExceedRetryLimit` hrefs with `original_link` and JSON `original_query`.

Use existing `src/lib/routing/path-utils.ts` where it already covers behavior. Extend it with tests instead of adding route string logic inside components.

### Shared Jikan Detail Data Layer

Create typed Jikan display modules, preferably:

- `src/server/anime/jikan-detail.ts`
- `src/server/anime/jikan-detail-normalize.ts`

Required behavior:

- Fetch detail display data from `https://api.jikan.moe/v4/anime/${targetAnimeId}/full`.
- Fetch relation display data from either the full detail response relations field, if present, or `https://api.jikan.moe/v4/anime/${targetAnimeId}/relations`.
- Use a single retry helper with the current baseline retry count and delay. Baseline effectively attempts the initial request plus retries before navigating to `/ExceedRetryLimit`; document the exact number in the helper test.
- Treat non-2xx responses, invalid JSON, missing `data`, and mismatched `data.mal_id` as failures.
- Jikan data is public display data. Use either a short `revalidate` or `cache: "no-store"` consistently and document the reason.
- Do not call browser APIs from Jikan server data modules.

Normalize Jikan detail into a display-only view model:

```ts
export type JikanAnimeDetailViewModel = {
  malId: number;
  title: string;
  englishTitle: string | null;
  displayTitle: string;
  imageUrl: string | null;
  status: string | null;
  statusLabel: string;
  seasonLabel: string | null;
  episodes: number | null;
  score: number | null;
  scoredBy: number | null;
  rank: number | null;
  popularity: number | null;
  favorites: number | null;
  genres: Array<{ id: number | null; name: string }>;
  synopsis: string | null;
  source: string | null;
  studios: string[];
  rating: string | null;
  airedLabel: string | null;
  broadcast: { day?: string | null; time?: string | null; timezone?: string | null; label?: string | null } | null;
  trailerEmbedUrl: string | null;
  licensors: string[];
  duration: string | null;
  relations: Array<{
    relation: string;
    entries: Array<{ malId: number; name: string; type?: string | null }>;
  }>;
};
```

Normalization requirements:

- `displayTitle` falls back from English title to default title to `Anime #<malId>`.
- `imageUrl` falls back from WebP large to JPG large to any available Jikan image URL to local placeholder or `null`.
- Missing arrays normalize to `[]`.
- Missing strings normalize to `null`.
- Missing broadcast/trailer/aired/studios/genres/licensors/synopsis never crash rendering.
- Preserve trailer iframe rendering when `trailer.embed_url` exists.
- Build trailer iframe URL with `autoplay=0` without assuming a fixed string suffix length.
- Preserve synopsis expand/collapse behavior.
- Preserve current Adaptation relation behavior: adaptation entries render as plain text unless the product decision changes.

### Shared MAL Tracking Data Layer

Create typed MAL tracking modules, preferably:

- `src/server/mal/anime.ts`
- `src/server/mal/anime-normalize.ts`
- `src/Utility/tracking/mal-tracking-item.ts`

Required MAL fields:

```ts
export const MAL_TRACKING_FIELDS =
  "id,title,main_picture,alternative_titles,start_date,end_date,mean,num_scoring_users,popularity,media_type,status,genres,num_episodes,start_season,broadcast,source,average_episode_duration,rating,my_list_status";
```

Add a public client-auth MAL helper:

```ts
export async function fetchPublicAnimeForTracking(id: string | number): Promise<MalAnimeDetail>
```

Rules:

- Public tracking page data fetches use `X-MAL-CLIENT-ID`.
- User-list/save/delete endpoints continue using `Authorization: Bearer <accessToken>`.
- Tracking page must not require OAuth just to render.
- If the user is authenticated and an access token is available server-side, it is acceptable to request `my_list_status`; otherwise localStorage remains the source for local selected status.
- Treat non-2xx MAL responses, invalid JSON, and mismatched `id` as failures.

Normalize MAL detail into the localStorage list item shape:

```ts
export type MalTrackingItem = {
  node: {
    id: number;
    main_picture?: { large?: string | null; medium?: string | null };
    status?: string | null;
    start_season?: { season?: string; year?: number } | null;
    num_episodes?: number | null;
    title?: string | null;
    alternative_titles?: {
      en?: string | null;
      ja?: string | null;
      synonyms?: string[];
    };
    mean?: number | null;
    num_scoring_users?: number | null;
    popularity?: number | null;
    genres?: Array<{ id?: number; name?: string }>;
  };
  list_status: {
    status: string | null;
    score: number;
    num_episodes_watched: number;
    is_rewatching: boolean;
    updated_at: string | null;
  };
};
```

MAL tracking normalization requirements:

- Preserve `node.id` as the target anime ID. For relation tracking, this must be `relation_id`, not source `mal_id`.
- Do not convert from Jikan fields.
- Keep MAL status enums like `not_yet_aired`, `currently_airing`, and `finished_airing` internally.
- Initialize missing `list_status` to:
  - `status: null`
  - `score: 0`
  - `num_episodes_watched: 0`
  - `is_rewatching: false`
  - `updated_at: null`
- Normalize `num_episodes` to `null` when unknown; derive `safeEpisodeCount = 0` separately for UI controls.
- Keep image/title/alternative title fields optional-safe.

After this migration, remove `src/Utility/tracking/jikantomalformat.js` from tracking route usage. Delete it only after no imports remain.

### Shared Components

Create these shared components under `src/app/_components/anime-detail/` or another consistent App Router component folder:

- `AnimeDetailPage.tsx`: server wrapper that parses params, fetches Jikan detail/relation display data, handles retry-limit redirect, and passes normalized display data/context to the client component.
- `AnimeDetailClient.tsx`: client component for synopsis expand/collapse, trailer iframe, responsive overflow detection, relation links, and add-to-watchlist CTA.
- `TrackingPage.tsx`: server wrapper that parses params, fetches MAL tracking data, handles retry-limit redirect, and passes MAL tracking item/context to the client component.
- `TrackingClient.tsx`: client component for status buttons, progress carousel, score carousel, save/delete, toasts, localStorage status detection, and client-side navigation after save/delete.

Component requirements:

- Keep tracking UI client-side because it owns refs, Embla carousel APIs, toasts, localStorage, button state, and route navigation.
- Detail pages may server-fetch Jikan data, but synopsis overflow detection must remain client-side.
- Server wrappers must pass serializable props only.
- Do not import `next/router` anywhere under `src/app`, shared route helpers, or new components.
- Use `next/navigation` `redirect`, `notFound`, or client `useRouter` depending on where the error occurs.
- Prefer passing explicit `mal_id`, `relation_id`, and computed `to` into `Add_to_watchlist_button` so it does not infer the wrong target.
- Keep relation links using `buildRelationHref` semantics: when already on a relation route, replace the relation ID instead of nesting another relation segment.
- Use stable `key` props for genres, studios, licensors, relations, relation entries, status buttons, and carousel items.

## Tracking LocalStorage And Status Behavior

The storage behavior is user data. Treat it as high-risk and test it before deleting duplicated routes.

Required behavior:

- Watchlist keys remain exactly:
  - `Watching`
  - `Completed`
  - `PlanToWatch`
  - `OnHold`
  - `Dropped`
- Values stored in those maps should be `MalTrackingItem`, not Jikan data.
- Save adds the anime to exactly one selected list and removes it from all other lists.
- Delete removes the anime ID from all five lists, not only the first matching list.
- Corrupted or missing watchlist keys must not crash the tracking page, detail CTA, save, delete, or initial selected-state detection.
- Preserve local-only save/delete delay near `1000ms`.
- Preserve authenticated save delay near `3500ms` and delete delay near `3000ms`.
- Authenticated save still calls `/api/users/data/save_anime?anime_id=...&status=...&episode=...&score=...`.
- Authenticated delete still calls `/api/users/data/delete_anime?anime_id=...`.
- Keep `looping_updater` and `cross_check` behavior unless a test proves a bug that must be fixed here.
- Clamp progress and score before saving:
  - progress minimum `0`;
  - progress maximum `safeEpisodeCount`;
  - score minimum `0`;
  - score maximum `10`.
- Unknown-episode anime should not create an invalid carousel length. Use a minimum carousel length of `1` so progress `0` is selectable.
- Completed status should set progress to `safeEpisodeCount`; if episodes are unknown, keep progress `0` and do not crash.

Status button rules to preserve:

- `not_yet_aired`: disable `Watching` and `Completed`.
- `currently_airing`: disable `Completed`, allow `Watching`, `Plan To Watch`, `On Hold`, and `Dropped`.
- `finished_airing` and other completed/older statuses: allow all statuses unless the existing UI explicitly disabled them.
- Existing localStorage status should preselect the right status button, progress, and score after both carousels are ready.

## Implementation Plan

### 1. Capture Pre-Migration State

Run and save the useful output in the task notes or commit message:

```powershell
rg -n "from ['\"]next/router['\"]" src/pages/Anime src/pages/morethiseseason src/pages/morelastseason src/pages/moreupcoming src/pages/search src/pages/mylist src/pages/seasons
rg -n "router\.query|router\.asPath|router\.push|relation_id|jikantomal|localStorage|Numberedcarousel" src/pages/Anime src/pages/morethiseseason src/pages/morelastseason src/pages/moreupcoming src/pages/search src/pages/mylist src/pages/seasons
rg -n "api\.jikan\.moe/v4|jikantomalformat|images\.webp\.large_image_url|broadcast\.day|trailer\.embed_url|studios\.map|aired\.string|num_episodes\+1" src
```

Confirm the route list still matches `migration_plan/baseline/routes.md`.

### 2. Add Pure Route And Data Helpers First

Implement and test:

- numeric param parsing;
- detail route context construction for every family;
- `targetAnimeId` selection;
- current pathname generation;
- detail back href generation;
- tracking href generation;
- tracking return href generation;
- relation href replacement;
- retry-limit href generation;
- Jikan detail normalization;
- Jikan relation normalization;
- MAL tracking item normalization;
- safe watchlist map parsing and mutation helpers.

Do not create App Router page files until these helpers have Vitest coverage.

### 3. Build The Pilot Family

Pilot only `/Anime/[mal_id]/**` first:

- `src/app/Anime/[mal_id]/page.tsx`
- `src/app/Anime/[mal_id]/tracking/page.tsx`
- `src/app/Anime/[mal_id]/relation/[relation_id]/page.tsx`
- `src/app/Anime/[mal_id]/relation/[relation_id]/tracking/page.tsx`

Pilot parity checklist:

- `/Anime/1` fetches Jikan anime `1` and renders the same major visual sections as the baseline screenshot.
- `/Anime/1` preserves trailer iframe when Jikan provides `trailer.embed_url`.
- `/Anime/1/tracking` fetches MAL anime `1`, not Jikan.
- `/Anime/1/tracking` saves a `MalTrackingItem` to localStorage.
- `/Anime/1/tracking` can save and delete locally.
- `/Anime/1/relation/5` fetches Jikan anime `5`, not anime `1`.
- `/Anime/1/relation/5/tracking` fetches MAL anime `5`, saves/deletes anime `5`, then returns to `/Anime/1/relation/5`.
- Add-to-watchlist on relation detail points to `/Anime/1/relation/5/tracking`.
- Relation links from `/Anime/1/relation/5` replace `5` with the next relation ID.
- Repeated Jikan detail failure navigates to `/ExceedRetryLimit` with original link/query context.
- Repeated MAL tracking failure navigates to `/ExceedRetryLimit` with original link/query context.

Only after pilot parity should the old pilot Pages Router files be deleted.

### 4. Migrate Remaining Families Incrementally

Migrate in this order to catch increasingly complex route contexts:

1. `morethiseseason`, `morelastseason`, `moreupcoming`
2. `search/[title]`
3. `seasons/[season]/[year]`
4. `mylist/[mylist_tab]`

For each family:

- add the four App Router files;
- use the same shared server/client components;
- add or extend helper test cases for that family;
- add a Playwright smoke for one detail route and one relation tracking route;
- manually open all four URLs once;
- delete the matching `src/pages/**` files only after automated and manual parity pass.

### 5. Remove Pages Router Duplicates

After all route families pass:

- remove migrated detail/tracking files under `src/pages/**`;
- keep unrelated list, mylist, login/logout, retry, testbed, and legacy routes that belong to other tasks;
- run:

```powershell
rg -n "from ['\"]next/router['\"]" src/pages/Anime src/pages/morethiseseason src/pages/morelastseason src/pages/moreupcoming src/pages/search src/pages/mylist src/pages/seasons
rg -n "jikantomalformat" src
```

Remaining `next/router` matches should be unrelated parent/list routes or documented Task 08 work. `jikantomalformat` should have no route-family imports.

## Deliverables

- App Router page files for every route in the matrix.
- Shared typed detail route context helpers.
- Shared typed Jikan detail/relation fetch and display normalization helpers.
- Shared typed MAL tracking fetch and `MalTrackingItem` normalization helpers.
- Shared detail and tracking server/client components.
- Safe watchlist storage helpers used by tracking save/delete/status detection.
- Updated or extended route helper tests.
- Removed duplicate Pages Router detail/tracking files after parity.
- No migrated tracking route imports or calls `jikantomalformat`.
- Vitest and Playwright coverage listed below.

## Definition Of Done

- Every old detail, relation, and tracking URL in the route matrix resolves from `src/app`.
- No migrated detail/tracking route imports `next/router`.
- Detail and relation pages fetch Jikan display data and preserve trailer rendering.
- Tracking pages fetch MAL data and store MAL-compatible list items.
- Relation routes use `relation_id` for displayed detail data and tracking data while preserving source `mal_id` as route context.
- Tracking save/delete updates localStorage exactly once and removes duplicates from other lists.
- Authenticated tracking still calls existing MAL proxy route handlers with the same query parameters.
- Add-to-watchlist and tracking return paths are correct for all seven route families.
- Retry-limit navigation works after repeated Jikan detail failure and repeated MAL tracking failure.
- Pages Router duplicates for migrated detail/tracking routes are removed only after parity.
- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, and targeted Playwright tests pass.

## Testing

### Vitest

Route-context tests:

- parses every route family in the matrix;
- rejects invalid IDs and years;
- chooses `targetAnimeId = mal_id` for normal detail/tracking routes;
- chooses `targetAnimeId = relation_id` for relation detail/tracking routes;
- builds add-to-watchlist tracking hrefs for all normal and relation routes;
- builds tracking return hrefs for all normal and relation tracking routes;
- builds retry-limit hrefs with encoded `original_link` and JSON `original_query`;
- preserves search title path encoding.

Jikan display normalization tests:

- full Jikan detail maps every displayed field;
- missing English title falls back to default title;
- missing all titles falls back to `Anime #<malId>`;
- missing WebP image falls back to JPG image;
- missing all images uses placeholder or returns `null` consistently;
- missing `broadcast`, `trailer`, `studios`, `genres`, `licensors`, `aired`, `duration`, `rating`, `source`, `relations`, or `synopsis` does not throw;
- malformed trailer embed URL is not trimmed by fixed substring length;
- trailer URL is rewritten or extended to disable autoplay without breaking valid URLs;
- relation entries normalize `mal_id` to `malId`;
- Adaptation relation entries remain identifiable for plain-text rendering.

MAL tracking normalization tests:

- full MAL detail maps to `MalTrackingItem`;
- relation tracking preserves `node.id = relation_id`;
- missing `main_picture`, `alternative_titles`, `genres`, `start_season`, `mean`, `num_scoring_users`, `popularity`, or `num_episodes` does not throw;
- missing `my_list_status` initializes local defaults;
- MAL status enums remain usable by tracking button rules;
- unknown episode count derives safe progress behavior without mutating `node.num_episodes`.

Tracking storage tests:

- safe parser handles missing, empty, invalid, and wrong-shape storage values;
- save to each status adds to that list and removes from the other four lists;
- delete removes the anime ID from all five lists;
- duplicate entries across lists collapse after save/delete;
- corrupted storage does not crash save/delete;
- progress and score are clamped;
- completed click with unknown episodes leaves progress at `0`;
- saved item is MAL-shaped and does not contain Jikan-only fields like `mal_id`, `images.webp`, or `trailer`.

Component tests:

- `AnimeDetailClient` renders with full Jikan display data;
- `AnimeDetailClient` renders with missing optional Jikan fields;
- synopsis expand/collapse appears only when content overflows;
- trailer iframe renders only when a safe embed URL exists;
- relation links replace the current relation ID instead of nesting;
- `TrackingClient` renders from MAL tracking data;
- `TrackingClient` disables status buttons for not-yet-aired and currently-airing anime;
- existing localStorage entry preselects status/progress/score;
- local-only save/delete schedules return navigation;
- authenticated save/delete calls mocked route handlers and keeps toast behavior.

### Playwright

Use network interception for both Jikan and MAL. Do not depend on live upstream APIs.

Required browser journeys:

- `/Anime/1` detail calls mocked Jikan `/anime/1/full` and renders major sections.
- `/Anime/1` detail renders trailer iframe from mocked Jikan data.
- `/Anime/1` detail with missing optional Jikan fields renders without console errors.
- `/Anime/1/tracking` calls mocked MAL `/anime/1`, not Jikan.
- `/Anime/1/tracking` saves MAL-shaped anime `1` to localStorage and returns to `/Anime/1`.
- `/Anime/1/relation/5` calls mocked Jikan `/anime/5/full` and renders relation anime title.
- `/Anime/1/relation/5/tracking` calls mocked MAL `/anime/5`, saves anime `5`, and returns to `/Anime/1/relation/5`.
- `/morethiseseason/1/relation/5/tracking`, `/search/NA/1/relation/5/tracking`, `/mylist/Watching/1/relation/5/tracking`, and `/seasons/spring/2026/1/relation/5/tracking` have correct return paths.
- Tracking delete removes the anime ID from all five localStorage lists.
- Authenticated save calls `/api/users/data/save_anime` with expected `anime_id`, `status`, `episode`, and `score`.
- Authenticated delete calls `/api/users/data/delete_anime` with expected `anime_id`.
- Repeated Jikan failure from detail pages navigates to `/ExceedRetryLimit`.
- Repeated MAL failure from tracking pages navigates to `/ExceedRetryLimit`.
- Mobile viewport shows detail and tracking without overlapping fixed nav/bottom spacing.

Console assertions:

- no `next/router` App Router error;
- no `window is not defined`;
- no `localStorage is not defined`;
- no hydration mismatch caused by client-only tracking state;
- no unhandled promise rejection during failed fetch retries.

## Edge Cases To Watch

- `mal_id` and `relation_id` are both present and the source ID is accidentally fetched or saved instead of the relation ID.
- Detail relation routes fetch Jikan source anime instead of Jikan relation anime.
- Tracking relation routes fetch MAL source anime instead of MAL relation anime.
- Relation link generation appends `/relation/:id/relation/:id` instead of replacing the relation ID.
- Search title contains encoded spaces, slashes removed by old sanitization, Unicode, or reserved URL characters.
- `mylist_tab` contains characters that are valid path segments but not known tab names.
- `year` is non-numeric or outside a reasonable range.
- Jikan returns HTTP `429`, `404`, invalid JSON, `data: null`, or a response for a different `mal_id`.
- MAL returns HTTP `401`, `403`, `404`, `429`, invalid JSON, or a response for a different `id`.
- Anime has `episodes: null` or MAL `num_episodes: 0` and progress carousel length becomes invalid.
- Anime is not yet aired and `Watching`/`Completed` should be disabled.
- Anime is currently airing and `Completed` should be disabled.
- Jikan detail has no English title, no image, no trailer, no synopsis, no broadcast, no studios, no genres, no licensors, or no aired label.
- MAL tracking detail has no image, no English title, no `num_episodes`, no `my_list_status`, or no genres.
- Synopsis ref is null during hydration or after route transitions.
- Direct DOM mutation with `innerHTML` or `classList` fights React state in tracking buttons.
- Back-link path accidentally strips too many segments.
- Duplicate localStorage entries across watchlist categories.
- localStorage/sessionStorage unavailable, blocked, or corrupted.
- Save/delete navigation fires after component unmount; clean up timers where practical.
- App Router redirects lose original route context for `/ExceedRetryLimit`.

## Maintenance Trace

Implementation summary:

- Migrated the detail, relation, and tracking route families from duplicated Pages Router files into App Router route wrappers backed by shared `AnimeDetailPage`, `AnimeDetailClient`, `TrackingPage`, and `TrackingClient` components.
- Added typed route-context helpers so every family derives a consistent `sourceAnimeId`, `targetAnimeId`, relation context, tracking href, return href, relation href, and retry-limit href.
- Added Jikan display fetch/normalization for detail pages and MAL tracking fetch/normalization for tracking pages. Detail pages remain Jikan-only because trailer and rich display metadata come from Jikan; tracking pages are MAL-only so local watchlist entries stay MAL-compatible.
- Added safe watchlist storage helpers and updated save/delete behavior so a save writes to exactly one list, removes duplicates from the other lists, and delete removes the anime from all five lists.
- Removed the duplicated Pages Router detail/tracking files after the App Router replacements and smoke coverage were in place.

Post-review hardening:

- Replaced the remaining raw localStorage parsing in tracking preselect logic with the safe watchlist parser so corrupted storage cannot crash the tracking page.
- Clamped preselected and saved progress/score values before carousel scrolling or persistence. This protects unknown-episode anime, malformed stored values, and stale localStorage entries.
- Encoded dynamic route segments when building detail/tracking/relation paths, while avoiding double-encoding already-encoded search titles.
- Rendered relations from the server-normalized Jikan detail data instead of refetching relations in the browser. This keeps relation links on the same data layer, cache/retry behavior, and test surface as the rest of the detail page.
- Dropped unsafe trailer iframe URLs and malformed relation entries during Jikan normalization.
- Treated MAL `num_episodes: 0` as unknown (`null`) so tracking UI uses the safe minimum progress carousel length.
- Hardened authenticated tracking follow-up checks for MAL status names like `plan_to_watch` and delete flows where no status is currently selected.

Validation run after hardening:

- `npm run typecheck`
- `npm run test` (`17` files, `175` tests)
- `npm run lint` (passes with the existing warnings)
- `npm run build`
- `npm run test:e2e` (`16` Playwright tests across desktop and mobile)
