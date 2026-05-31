# Task 08: My List, Worker Sync, and Auth UX

## Purpose

Migrate `/mylist` and the My List auth/status pages from the Pages Router to the App Router while preserving local watchlist behavior, MAL sync, backup/restore, tab/sort/scroll state, and authenticated profile rendering.

This is the highest-risk remaining user-owned data area. A junior engineer should be able to implement this route by route without guessing storage keys, worker message shape, auth/session semantics, or when old Pages Router files can be removed.

## Current Baseline

- App Router shell and providers already exist in `src/app/layout.tsx` and `src/app/providers.tsx`.
- `Persistent_worker` currently wraps the whole App Router tree and starts `/worker/worker.js` once when `/api/users/auth/session` reports an authenticated session.
- The root My List page still lives at `src/pages/mylist/index.tsx` and imports `next/router`.
- Auth/status/profile pages still live under `src/pages/mylist/**`.
- My List detail/tracking child routes already have App Router files under `src/app/mylist/[mylist_tab]/**` from Task 07.
- Watchlist localStorage keys must remain exactly:
  - `Watching`
  - `Completed`
  - `PlanToWatch`
  - `OnHold`
  - `Dropped`
- Watchlist values are persisted as JSON arrays of `[animeId, MalTrackingItem]` pairs.
- Tab labels shown in the UI are:
  - `Plan To Watch`
  - `Completed`
  - `Watching`
  - `On Hold`
  - `Dropped`
- Path/storage tab segment names are:
  - `PlanToWatch`
  - `Completed`
  - `Watching`
  - `OnHold`
  - `Dropped`
- Session storage keys currently used by My List are:
  - `activetab`
  - `sort_type`
  - `sorted_anime`
  - `slicearr`
  - `scrollY`
- Existing auth/session client code should use `fetchAuthSession()` from `src/lib/auth-session.ts`.
- The session route is `/api/users/auth/session`.
- Token refresh is `/api/users/auth/refresh_accesstoken` and accepts `GET` and `POST`.
- Login starts at `/api/users/auth/authorize`.
- Logout starts at `/api/users/auth/log_out`.
- OAuth callback redirects to `/mylist/login_success` or `/mylist/login_failed`.
- Logout redirects to `/mylist/logout_success` or `/mylist/login_failed`.
- The worker script is `public/worker/worker.js` and is loaded by URL `/worker/worker.js`.

## Non-Goals

- Do not redesign the My List UI.
- Do not change public URLs, tab labels, storage key names, or path segment casing.
- Do not replace the storage architecture with server state.
- Do not change MAL proxy endpoint URLs or auth cookie semantics.
- Do not migrate unrelated pages outside `/mylist` in this task.
- Do not remove `embla-carousel-react` if it is still required by `src/components/ui/carousel.tsx`; shadcn/ui Carousel uses Embla internally.
- Do not remove `src/pages/_app.js` or `src/pages/_document.js`; that belongs to final cleanup after all Pages Router routes are gone.

## Route Matrix

Create these App Router routes and remove the matching Pages Router files only after parity is proven.

| Public route | App Router file | Current Pages Router file | Main component behavior |
| --- | --- | --- | --- |
| `/mylist` | `src/app/mylist/page.tsx` | `src/pages/mylist/index.tsx` | Client-owned watchlist tabs, sort, scroll, worker sync reconciliation |
| `/mylist/login` | `src/app/mylist/login/page.tsx` | `src/pages/mylist/login/index.tsx` | Login CTA redirects to `/api/users/auth/authorize` |
| `/mylist/login_success` | `src/app/mylist/login_success/page.tsx` | `src/pages/mylist/login_success/index.tsx` | Starts worker sync, writes all lists, redirects to `/mylist` |
| `/mylist/login_failed` | `src/app/mylist/login_failed/page.tsx` | `src/pages/mylist/login_failed/index.tsx` | Failure message and timed redirect to `/mylist` |
| `/mylist/logout_success` | `src/app/mylist/logout_success/page.tsx` | `src/pages/mylist/logout_success/index.tsx` | Clears local watchlists/session state and redirects to `/mylist` |
| `/mylist/user_profile` | `src/app/mylist/user_profile/page.tsx` | `src/pages/mylist/user_profile/index.tsx` | Reads session user data, stats, completed-list top/worst rated |

Route conflict rule:

- Do not leave `src/app/mylist/page.tsx` and `src/pages/mylist/index.tsx` matching the same public route in a green build.
- Capture the Pages Router baseline first, extract shared client code/tests, then add the App Router route and delete the matching Pages route in the same change.
- If live side-by-side parity is needed, use baseline screenshots/tests or a temporary non-public preview route that does not conflict with `/mylist`.

## Required Architecture

### Client Boundaries

All six pages above can be Client Components because they depend on `window`, `localStorage`, `sessionStorage`, timers, file uploads, workers, and client navigation.

Rules:

- Add `"use client"` at the top of each page or move behavior into a client component imported by a thin page wrapper.
- Do not import `next/router` anywhere under `src/app/mylist/**`.
- Use `next/navigation` directly or the existing `useCurrentRoute()` compatibility hook.
- Guard every browser API access behind client effects, event handlers, or `typeof window !== "undefined"` helpers.
- Keep props serializable when passing data from any future server wrapper into client components.

### Watchlist Storage Helpers

Use or extend `src/Utility/tracking/watchlist-storage.ts` instead of adding new raw `JSON.parse(localStorage.getItem(...))` calls.

Required helper behavior:

- `getWatchlistMap(key)` returns an empty `Map` for missing, empty, invalid JSON, wrong top-level shape, malformed map pairs, or unavailable `localStorage`.
- The parser accepts current `[id, item]` map-pair arrays.
- The parser may keep accepting legacy item arrays only as a compatibility fallback.
- The parser drops entries whose ID is not a finite positive number.
- The parser drops entries with missing `node.id` or mismatched pair ID and `node.id`.
- Save always writes `JSON.stringify([...map])`.
- Helper exports should include a stable tab/storage mapping so UI labels and storage keys are not repeatedly derived with `split(" ").join("")`.

Recommended exports:

```ts
export const MYLIST_TABS = [
  { label: "Plan To Watch", storageKey: "PlanToWatch", hrefSegment: "PlanToWatch" },
  { label: "Completed", storageKey: "Completed", hrefSegment: "Completed" },
  { label: "Watching", storageKey: "Watching", hrefSegment: "Watching" },
  { label: "On Hold", storageKey: "OnHold", hrefSegment: "OnHold" },
  { label: "Dropped", storageKey: "Dropped", hrefSegment: "Dropped" },
] as const;
```

Storage migration must never silently rename existing keys.

### My List State

The `/mylist` page must preserve:

- local-only mode for unauthenticated users;
- authenticated MAL sync for logged-in users;
- active tab in `sessionStorage.activetab`;
- sort selection in `sessionStorage.sort_type`;
- sorted rows in `sessionStorage.sorted_anime`;
- infinite scroll slice count in `sessionStorage.slicearr`;
- scroll restore in `sessionStorage.scrollY`;
- mobile swipe tab switching through `useSwipeGesture`;
- links from list rows to `/mylist/<tabSegment>/<animeId>`.

Rules:

- Default active tab is `Plan To Watch` when no saved tab exists.
- Accept legacy saved tab values `PlanToWatch` and `OnHold`, but normalize them for display only.
- Reject unknown saved tab values and fall back to `Plan To Watch`.
- Persist `sessionStorage.activetab` as the display label (`Plan To Watch`, `On Hold`, etc.).
- Tab changes reset `scrollY`, `sort_type`, `sorted_anime`, and slice count.
- `Tabs onValueChange` should be the single source of truth for tab changes and reset behavior. Do not rely on individual trigger `onClick` handlers for behavior that must also apply to keyboard, swipe, or programmatic changes.
- Sort must apply only to the active tab, not all five tabs.
- Treat `sorted_anime` as an active-tab-only derived cache. On mount, apply it only to the normalized active tab and initialize inactive tabs from their own localStorage keys.
- If `sorted_anime` entries do not belong to the active tab, discard them and recompute from localStorage.
- Safe sort parsing must accept legacy JSON-stringified values such as `"TopScore"` and raw values such as `TopScore`.
- Empty string, `null`, malformed JSON, or unknown sort mode means no active sort. Persist one canonical sort shape after migration and test both legacy and canonical reads.
- Clearing sort must restore each tab from its own watchlist storage.
- On mount, parse active tab, parse slice count, render enough rows, restore `scrollY`, and only then enable infinite-scroll increments.
- Infinite scroll must not increment before the initial render restoration is complete.
- Infinite scroll should only increase `slicearr` when `visibleCount < activeTabRows.length`.
- Throttle or guard the scroll handler so one bottom reach does not enqueue multiple `+30` updates.
- Slice count must be a finite integer, minimum `30`; malformed `slicearr` falls back to `30`.
- Canonical reset value for `slicearr` is `30` unless the implementation deliberately preserves the legacy `31` quirk and documents why.
- `slicearr` should reset on logout and restore.
- `scrollY` must be finite and non-negative; malformed values fall back to `0`.
- Build row hrefs only from `MYLIST_TABS.hrefSegment`, never from `label.split(" ").join("")`.
- Drop rows with invalid normalized `node.id` before render so React keys and hrefs are stable.
- Define swipe direction explicitly:
  - left swipe advances `Plan To Watch -> Completed -> Watching -> On Hold -> Dropped -> Plan To Watch`;
  - right swipe reverses that order and wraps.
- Swipe changes must write the normalized display label to `sessionStorage.activetab`.
- Ignore swipe gestures that start inside links, buttons, dropdowns, dialogs, file inputs, or the horizontally scrollable tab list.
- Rendered list rows must tolerate missing optional MAL fields:
  - missing image;
  - missing English title;
  - missing status;
  - missing `start_season`;
  - missing score/users/ranking;
  - missing genres;
  - missing `list_status`.
- Create a row-view-model helper before rendering cards:
  - status formats from `node.status ?? ""`;
  - season prefers `node.start_season.{season,year}` and falls back to legacy `node.season`/`node.year`;
  - title prefers `node.alternative_titles.en` only when present, otherwise `node.title`, otherwise `Anime #<id>`;
  - image, score, users, ranking, and genres always have stable fallbacks.
- The migrated `/mylist` page must not call the old `progress()` helper if it parses localStorage directly. Watching progress should come from the already-normalized row item, for example `item.userprogress ?? item.list_status?.num_episodes_watched ?? 0`.

### Worker Sync Contract

The worker contract is:

- script URL: `/worker/worker.js`;
- start message: `'start'`;
- success message shape should be upgraded from `{ collectionarr }` to include per-category metadata:

```ts
{
  collectionarr: unknown[];
  categoryResults: {
    Watching: "success" | "failed";
    Completed: "success" | "failed";
    OnHold: "success" | "failed";
    Dropped: "success" | "failed";
    PlanToWatch: "success" | "failed";
  };
  errors?: Array<{ category?: string; status?: number; message: string }>;
  userDataResult?: "success" | "failed";
}
```

- `collectionarr[0]`: `Watching`;
- `collectionarr[1]`: `Completed`;
- `collectionarr[2]`: `OnHold`;
- `collectionarr[3]`: `Dropped`;
- `collectionarr[4]`: `PlanToWatch`.

The worker fetches:

- `/api/users/data/userlist?&sort=list_updated_at&offset=<offset>&status=watching`
- `/api/users/data/userlist?&sort=list_updated_at&offset=<offset>&status=completed`
- `/api/users/data/userlist?&sort=list_updated_at&offset=<offset>&status=on_hold`
- `/api/users/data/userlist?&sort=list_updated_at&offset=<offset>&status=dropped`
- `/api/users/data/userlist?&sort=list_updated_at&offset=<offset>&status=plan_to_watch`
- `/api/users/data/user_data`

Required behavior:

- Worker creation must be skipped when `typeof Worker === "undefined"`.
- Sync must run once per relevant lifecycle, not once per render.
- Sync writes must use a generation/session guard so stale messages from an older session cannot write after logout, re-login, route unmount, or a newer sync start.
- `/mylist/login_success` should perform a dedicated first-login sync even if global `Persistent_worker` also exists.
- `/mylist` should not start a duplicate sync if global `Persistent_worker` already covers the authenticated session, unless the page intentionally owns a foreground sync with clear de-duping.
- Worker messages must be shape-checked before writing storage.
- `collectionarr` entries must be converted through safe map normalization before persistence.
- Storage writes may only replace categories whose `categoryResults` value is `success`.
- Legitimately empty successful categories may write `[]` only when explicitly marked `success`.
- If one status fetch fails, do not overwrite that local category with an empty map.
- Before persisting worker results, validate and serialize all categories to be written. If validation or serialization fails, write nothing for that sync.
- If `localStorage.setItem` throws mid-batch, preserve old data where practical and surface a non-fatal sync failure.
- A 401 or 403 during worker fetch should attempt one token refresh through `/api/users/auth/refresh_accesstoken`, then retry the failed request once.
- Token refresh must be single-flight per browser context. Concurrent worker/page refresh attempts should share one in-flight refresh promise or lock.
- If refresh fails, stop the worker sync, preserve existing localStorage, and allow the UI to remain in local-only mode.
- All worker fetches to auth/data routes must use `credentials: "same-origin"` and `cache: "no-store"`.
- Refresh fetches must use the same credentials mode so `Set-Cookie` from refresh is honored before retry.
- Worker pagination must validate `result.data` as an array.
- Worker pagination must cap max pages per status, stop on malformed `paging.next`, and classify `429`/`5xx` as transient failures.
- Worker sync should await `/api/users/data/user_data` before reporting complete, or report list sync and user-data sync separately.
- Terminate route-owned workers on unmount.
- Global persistent worker should not terminate on normal page transitions, but it must not write after receiving malformed payloads.
- Logout is not a normal page transition: logout must terminate or invalidate global and route-owned workers before clearing storage.
- `Persistent_worker` must reset internal module state on terminal failure, malformed payload, logout success, and test cleanup so logout-then-login in the same browser session can start a fresh sync.
- Use `BroadcastChannel` or `storage` events to broadcast My List logout/sync invalidation across tabs.
- Add a test-only reset helper for module-level worker state if needed.

### Auth And Token Refresh

Use `fetchAuthSession()` for client auth state. Do not read the httpOnly access or refresh token cookies in client code.

Required behavior:

- Navbar account menu shows `Local Account` when unauthenticated and `My Account` when authenticated.
- Login CTA navigates to `/api/users/auth/authorize`.
- Logout CTA navigates to `/api/users/auth/log_out`.
- `expires_in` cookie is an ISO timestamp and may be missing or malformed.
- `isSessionExpiringSoon()` should return `false` for malformed dates.
- If the session is expired but a refresh token exists, the client may call refresh once before deciding unauthenticated.
- Refresh must not loop forever when the refresh endpoint returns 401/403.
- Refresh success should update the session state before starting worker sync.
- Refresh success that returns no refresh token should be treated as a failed refresh unless the server route intentionally preserves the old refresh token and tests prove it.
- User-facing auth flows must handle worker `onerror`, `onmessageerror`, malformed completion payloads, and sync timeout.
- `/mylist/login_success` must always resolve to redirect or recovery UI within a documented fallback timeout.
- User-facing auth pages must not expose access tokens, refresh tokens, or OAuth transient cookie values.

### Backup And Restore

Preserve the current backup file format unless explicitly migrating it:

```ts
[
  PlanToWatchEntries,
  WatchingEntries,
  CompletedEntries,
  OnHoldEntries,
  DroppedEntries
]
```

Requirements:

- Backup downloads `watchlist-backup.json`.
- Backup uses the safe watchlist parser for each category, so corrupted storage does not crash export.
- Restore accepts `.json` files even when browser MIME type is empty.
- Restore rejects invalid JSON, non-array top-level values, fewer than five arrays, and malformed entries.
- Restore should support older backup files with extra elements by reading only the first five arrays.
- Restore writes only after validation succeeds for all five categories.
- Invalid restore must preserve all five localStorage keys byte-for-byte.
- Restore clears `sort_type`, `sorted_anime`, `slicearr`, and `scrollY`.
- Restore refreshes the rendered list after writing storage.
- File input state should be reset after successful restore so the same file can be selected again.
- Cancelled file selection must leave state and storage unchanged.
- Object URLs created for download must be revoked after click.

### Logout Cleanup

`/mylist/logout_success` must clear:

- any active global or route-owned worker by termination or sync-generation invalidation;
- all five watchlist keys to `[]`;
- `activetab`;
- `sort_type`;
- `sorted_anime`;
- `slicearr`;
- `scrollY`;
- temporary validation/check keys that start with `needstocheck`;
- `addflag`.

It should then redirect to `/mylist` after the current baseline delay unless tests document a safer shorter delay.

Multi-tab behavior:

- Logout in one tab must invalidate in-flight syncs in other tabs.
- A worker that started before logout must not repopulate old MAL data after logout storage has been cleared.

### User Profile

`/mylist/user_profile` must preserve:

- fetch via `/api/users/auth/session`;
- profile card fields from `session.userData`;
- joined date rendering;
- anime statistics card rendering;
- top 10 and worst 10 rated cards from `Completed` localStorage.

Required behavior:

- If unauthenticated or missing `userData`, render a stable empty/auth-needed state instead of a blank page.
- Malformed `user_data` cookie must not crash profile rendering.
- Oversized user data may be omitted by `/api/users/data/user_data`; profile must handle `userData: null`.
- Invalid `joined_at` should render a fallback instead of `NaN` dates.
- Top-rated cards must tolerate corrupted `Completed` storage.
- Top/worst rated behavior should be deterministic for fewer than 10 entries, score ties, score `0`, missing score, and mixed valid/corrupted completed entries.
- Missing or malformed `anime_statistics` should render a stable fallback.

### Carousel And Dependency Cleanup

Do not blindly remove carousel dependencies in this task.

Rules:

- If `/mylist` does not use `swiper`, remove only My List usage or stale imports.
- If no source files import `swiper` after this task, remove the package in Task 09 cleanup.
- Keep `embla-carousel-react` while `src/components/ui/carousel.tsx` depends on it.
- If a My List-specific carousel is replaced, use existing shadcn/ui components or native CSS scroll snap and add mobile viewport tests.

## Implementation Plan

### 1. Capture Pre-Migration State

Run these commands and save useful findings in the PR description or task notes:

```powershell
rg -n "from ['\"]next/router['\"]|useRouter\\(" src/pages/mylist src/ComponentsSelf src/Utility
rg -n "localStorage|getItem\\(|setItem\\(|sessionStorage|activetab|sort_type|sorted_anime|slicearr|scrollY" src/pages/mylist src/ComponentsSelf src/Utility
rg -n "new Worker|worker\\.js|collectionarr|refresh_accesstoken|fetchAuthSession|expires_in" src public/worker
rg -n "swiper|embla-carousel-react" src package.json
```

Confirm `migration_plan/baseline/local-storage-fixtures/*.json` still covers empty, populated, and corrupted watchlists.

Fixture seeding rule:

- Add a shared test helper such as `seedMyListStorage(page, fixture)`.
- Valid fixture arrays must be stringified before writing to `localStorage`.
- Corrupted fixture raw strings must be written exactly as raw strings.
- `null` fixture values mean remove the key.
- The helper must verify all five watchlist keys after seeding so tests do not accidentally run against impossible storage state.

### 2. Harden Pure Helpers First

Before adding App Router page files, implement or extend tests for:

- tab label/storage/path mapping;
- safe watchlist parsing;
- safe watchlist serialization;
- safe session storage parsing for tab, sort, and slice state;
- backup validation and serialization;
- restore validation;
- worker payload normalization;
- worker response category mapping;
- sync generation/session invalidation;
- single-flight token refresh coordination;
- token-expiry helper behavior;
- user profile date formatting;
- row view-model normalization;
- route-regression checks that migrated App Router My List code does not import `next/router`.

Do not move `/mylist` until raw storage reads in the migrated code can be replaced or guarded.

### 3. Extract Reusable My List Components

Create a My List component boundary such as:

- `src/app/mylist/_components/MyListClient.tsx`
- `src/app/mylist/_components/MyListNavbar.tsx` if the existing navbar needs App Router-specific cleanup
- `src/app/mylist/_lib/mylist-tabs.ts`
- `src/app/mylist/_lib/mylist-storage-state.ts`
- `src/app/mylist/_lib/mylist-backup.ts`
- `src/app/mylist/_lib/mylist-worker-sync.ts`
- `src/app/mylist/_lib/mylist-row-view-model.ts`
- `src/app/mylist/_lib/mylist-refresh-lock.ts`

Acceptable alternative: reuse existing `src/ComponentsSelf/**` files after converting them to App Router-safe client components.

Component rules:

- Keep list rendering client-owned.
- Keep `Horizontalcard` visual output unchanged.
- Keep `Toaster` behavior.
- Replace `router.isReady` checks with App Router-compatible readiness assumptions or `useCurrentRoute()`.
- Replace route-change scroll handling with `usePathname()`, link-click save behavior, or the existing `useScrollSaver()` hook.
- Use `Link` from `next/link` for row links.
- Avoid duplicating the five tab render blocks if a small typed loop can render them without changing output.
- If reusing existing components such as `Top_rated`, remove raw unguarded storage parsing before they are used by App Router pages.

### 4. Migrate `/mylist`

Implement `src/app/mylist/page.tsx`.

Migration checklist:

- The page renders with empty storage.
- The page renders with all five populated storage maps.
- The page renders when one or more storage keys are corrupted.
- Active tab restoration works from display labels and legacy storage-key names.
- Clicking a tab resets scroll/sort/slice state.
- Keyboard tab changes reset scroll/sort/slice state.
- Mobile swipe changes tabs and updates `sessionStorage.activetab`.
- Horizontal tab-list scrolling does not accidentally change tabs.
- Sort applies to the active tab only.
- Clearing sort restores unsorted localStorage data.
- Infinite scroll increases visible rows and persists `slicearr`.
- Infinite scroll stops incrementing when every row in the active tab is visible.
- Row links use `/mylist/<tabSegment>/<animeId>`.
- Opening a row and going back restores active tab, scroll position, slice count, and sort state together.
- Unauthenticated users do not trigger MAL sync.
- Authenticated users receive worker sync results without duplicate worker races.
- Existing local data is preserved if worker sync fails.

Only remove `src/pages/mylist/index.tsx` after this checklist and tests pass.

### 5. Migrate Auth UX Pages

Implement:

- `src/app/mylist/login/page.tsx`
- `src/app/mylist/login_success/page.tsx`
- `src/app/mylist/login_failed/page.tsx`
- `src/app/mylist/logout_success/page.tsx`

Checklist:

- Login button navigates to `/api/users/auth/authorize`.
- Login success starts one foreground worker sync.
- Login success writes all five lists from the worker payload.
- Login success redirects to `/mylist` after sync or after a documented fallback timeout.
- Login success handles worker errors without hanging forever.
- Login success waits for user-data sync or has a documented split-completion behavior.
- Login failed redirects to `/mylist` after the baseline delay.
- Logout success clears all local watchlist and My List session state.
- Logout success invalidates stale syncs before clearing local state.
- Logout success redirects to `/mylist` after the baseline delay.
- Timers and workers are cleaned up on unmount.

Remove the matching `src/pages/mylist/login*` and `src/pages/mylist/logout_success` files only after parity.

### 6. Migrate User Profile

Implement `src/app/mylist/user_profile/page.tsx`.

Checklist:

- Authenticated profile renders user card, stats, top rated, and worst rated sections.
- Missing `session.userData` renders a clear non-crashing state.
- Invalid `joined_at` renders fallback text.
- Missing or malformed `anime_statistics` renders fallback text.
- Corrupted `Completed` localStorage does not crash top/worst rated sections.
- Back navigation returns to `/mylist`.

Remove `src/pages/mylist/user_profile/index.tsx` only after parity.

### 7. Remove Pages Router Duplicates

After all six routes pass automated and manual parity:

```powershell
rg -n "from ['\"]next/router['\"]|useRouter\\(" src/pages/mylist src/app/mylist src/ComponentsSelf src/Utility
rg -n "src/pages/mylist" migration_plan src tests
rg -n "new Worker|worker\\.js|collectionarr" src public/worker tests
```

Expected results:

- no `next/router` imports remain in migrated My List/auth/profile code;
- no duplicate `src/pages/mylist/**` route files remain for routes now served by `src/app/mylist/**`;
- worker references are intentional and covered by tests.

## Deliverables

- App Router `/mylist` page.
- App Router login, login success, login failed, logout success, and user profile pages.
- App Router-safe My List client components with no `next/router` import.
- Hardened watchlist/session storage helpers.
- Backup/restore validation helpers.
- Worker sync helper with payload validation, de-duping, and refresh handling.
- Unit tests for storage, backup/restore, worker payloads, token expiry, and profile formatting.
- Playwright auth/My List journeys with mocked network and worker-backed endpoint responses.
- Removed matching Pages Router files after parity.

## Definition Of Done

- `/mylist` works with empty storage, populated storage, corrupted storage, unavailable storage, and logged-in cookies.
- Local-only users can view, sort, swipe, backup, and restore lists without auth.
- Authenticated users sync all five MAL categories.
- Worker sync does not overwrite good local data with empty results on partial failure.
- Worker sync handles one 401/403 refresh attempt and stops cleanly if refresh fails.
- Login success sync populates localStorage and redirects as before.
- Login success cannot hang indefinitely if worker sync fails.
- Logout clears cookies through the server route and clears local UI/storage state on the success page.
- Backup export and restore import work for all five categories.
- User profile renders stats when session user data exists and fails gracefully when it does not.
- Mobile swipe tab switching works.
- Sort and slice state survive navigation exactly as baseline.
- No migrated My List/auth/profile code imports `next/router`.
- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, and targeted Playwright tests pass.

## Testing

### Test Harness Requirements

Worker harness:

- Vitest must use a fake `Worker` class with controllable `postMessage`, `onmessage`, `onerror`, `onmessageerror`, and `terminate`.
- The fake worker must support delayed messages, out-of-order messages, malformed payloads, message after unmount, and Strict Mode double-mount simulation.
- Tests must assert route-owned workers terminate and ignore late messages after unmount.
- Playwright must either mock `/worker/worker.js` directly or explicitly prove that route interception catches the fetches initiated by the real worker script.

Storage harness:

- Tests must include helpers for normal storage, missing keys, corrupted raw strings, and storage methods that throw.
- Include quota-exceeded style failures for `localStorage.setItem` during worker persistence and restore.
- Include throwing `getItem`, `setItem`, `removeItem`, and equivalent `sessionStorage` calls.

Fixture harness:

- Playwright storage seeding must use the shared `seedMyListStorage(page, fixture)` semantics from the implementation plan.
- Tests must assert the serialized localStorage values after seeding before visiting `/mylist`.

### Vitest

Storage helper tests:

- missing storage key returns an empty map;
- invalid JSON returns an empty map;
- wrong top-level shape returns an empty map;
- malformed map pairs are dropped;
- non-finite, zero, negative, string, decimal, `NaN`, and mismatched IDs are dropped;
- valid `[id, item]` pairs are preserved;
- legacy item arrays are accepted only if compatibility is intentionally retained;
- each watchlist key serializes back to `[id, item]` pairs;
- `getItem`, `setItem`, and `removeItem` throwing does not crash the UI flow that called the helper.

Tab/session state tests:

- default tab is `Plan To Watch`;
- `PlanToWatch` restores as `Plan To Watch`;
- `OnHold` restores as `On Hold`;
- canonical `activetab` writes display labels;
- unknown tab restores as `Plan To Watch`;
- malformed `slicearr` restores as `30`;
- slice count below `30` restores as `30`;
- canonical slice reset value is asserted for tab change, sort apply, sort clear, restore, and logout;
- `scrollY` rejects negative and non-finite values;
- sort state is scoped to the active tab;
- `sort_type` accepts legacy JSON-stringified values and raw values;
- `sorted_anime` is applied only to the active tab and discarded when it does not match the active tab.

Row view-model tests:

- formats MAL `node.status` labels safely;
- prefers `start_season` and falls back to legacy `season`/`year`;
- chooses English title only when present and otherwise falls back to `node.title` or `Anime #<id>`;
- uses fallback image, score, users, ranking, and genres;
- derives watching progress from normalized row item data instead of re-reading localStorage.

Backup/restore tests:

- backup serializes categories in the exact baseline order;
- backup does not throw when one category is corrupted;
- restore rejects invalid JSON;
- restore rejects non-array top-level data;
- restore rejects fewer than five category arrays;
- restore ignores extra category arrays;
- restore rejects malformed entries;
- restore writes nothing unless all five categories validate;
- valid first categories plus malformed fifth category writes nothing;
- invalid restore preserves all five localStorage keys byte-for-byte;
- quota/setItem failure during restore does not partially replace all categories silently;
- cancelled file selection leaves state and storage unchanged;
- empty MIME with `.json` is accepted;
- wrong extension with JSON content is rejected unless the implementation explicitly documents accepting content-based JSON;
- same file can be selected twice after input reset;
- object URL revocation is asserted for backup download;
- restore clears My List session keys.

Worker tests:

- normalizes `collectionarr` into the five watchlist keys in the documented order;
- requires `categoryResults` metadata before replacing a category;
- writes `[]` only for a category explicitly marked `success`;
- rejects missing `collectionarr`;
- rejects fewer than five categories;
- rejects malformed category payloads;
- preserves existing category data on partial worker failure;
- statuses 1 and 2 succeed, status 3 returns 401, refresh succeeds, retry succeeds, and statuses 4 and 5 continue;
- refresh fails after partial success and no existing category is overwritten by `[]`;
- starts once for authenticated session;
- does not start for unauthenticated session;
- handles `Worker` unavailable;
- attempts one refresh on 401/403;
- two simultaneous 401s produce one refresh request through the single-flight lock;
- does not retry refresh forever;
- worker fetches use `credentials: "same-origin"` and `cache: "no-store"`;
- malformed `paging.next` stops pagination;
- missing `result.data` array fails the category without crashing;
- 429 and 5xx are classified as transient failures;
- max-page guard prevents infinite pagination;
- stale generation/session messages are ignored after logout or newer sync start;
- terminates route-owned workers on unmount;
- route-owned worker handles `onerror`, `onmessageerror`, timeout, and malformed completion payload;
- global worker state resets after terminal failure, malformed payload, logout, and test cleanup;
- logout then login again in the same browser session starts a fresh sync;
- global persistent worker state can be reset in tests.

Auth/session tests:

- `fetchAuthSession()` returns unauthenticated on non-2xx response;
- `fetchAuthSession()` handles malformed JSON safely;
- `isSessionExpiringSoon()` returns false for missing or malformed dates;
- expiring session triggers at most one refresh attempt in the client flow;
- refresh 401/403 produces local-only UI state;
- login/logout navigation uses the existing route handler URLs;
- login success, login failed, and logout success fake-timer tests assert redirect happens once;
- fallback timeout works when worker sync never completes;
- unmount clears timers so no navigation fires afterward;
- tokens, OAuth codes, and transient cookie values are not rendered, stored, toasted, or logged.

My List component tests:

- renders empty state for every tab;
- renders populated rows for every tab;
- renders rows with missing optional anime fields;
- tab click updates `activetab`;
- swipe right/left cycles tabs and wraps at both ends;
- swipe ignores controls, links, dialogs, file inputs, and tab-list horizontal scroll;
- sort menu sorts top score, top members, completed, and airing;
- clearing sort restores localStorage order;
- infinite-scroll handler increments and persists slice count;
- infinite-scroll handler does not increment past the active tab row count;
- row links include the correct storage/path tab segment;
- back from `/mylist/<tab>/<id>` restores tab, scroll, slice, and sort together;
- corrupted storage does not crash initial render, tab switch, sort, or progress display.

User profile tests:

- renders profile card from `session.userData`;
- renders stats from `anime_statistics`;
- renders fallback when unauthenticated;
- renders fallback when `userData` is null;
- invalid `joined_at` does not render `NaN`;
- missing or malformed `anime_statistics` renders fallback UI;
- fewer than 10 completed entries render deterministically;
- score ties have deterministic ordering;
- score `0` and missing score are handled intentionally;
- corrupted entries mixed with valid completed entries do not crash top/worst rated cards;
- corrupted `Completed` storage does not crash top/worst rated cards.

Route regression tests:

- no migrated App Router My List file imports `next/router`;
- matching Pages Router files for migrated `/mylist` routes are absent after parity;
- no route-conflicting Pages/App files exist for the same My List public route.

### Playwright

Use Playwright route interception. Do not depend on live MAL.

Required browser journeys:

- seed empty storage and visit `/mylist`;
- seed populated storage and verify all five tabs;
- corrupt one storage key and verify fallback UI plus console has no uncaught parse error;
- switch tabs by click on desktop;
- switch tabs by swipe on mobile;
- sort each supported sort mode and clear sort;
- scroll enough to increase visible rows and verify `slicearr` persists after navigating to a row and back;
- choose a non-default tab, sort, scroll, open `/mylist/<tab>/<id>`, go back, and verify active tab, scroll position, slice count, and sort state restore together;
- backup download is created as `watchlist-backup.json`;
- restore upload updates localStorage and rendered list;
- restore rejects malformed JSON without changing existing localStorage byte-for-byte;
- restore rejects valid first categories plus malformed later category without changing existing localStorage;
- unauthenticated navbar shows local account actions;
- authenticated navbar shows account actions and user profile link;
- mock `/api/users/auth/authorize` navigation from login page;
- login success mocks worker-backed endpoint responses and populates all five localStorage keys;
- login success worker failure shows fallback behavior and still redirects or offers recovery;
- login success immediate navigation to user profile sees fresh user data or stable fallback behavior;
- logout success clears all watchlist and session keys;
- logout while an in-flight worker exists does not repopulate storage after clear;
- logout in one tab invalidates an in-flight sync in a second tab;
- logout then login again in the same browser session starts a fresh sync;
- profile route renders mocked session user data and statistics;
- profile route handles mocked unauthenticated session gracefully;
- expired session flow triggers one refresh request before worker sync;
- two simultaneous expired-session worker requests trigger one refresh request;
- refresh failure leaves existing localStorage untouched;
- mobile iPhone and Pixel viewports have no horizontal page overflow;
- mobile tab strip remains usable while swiping;
- bottom nav does not cover the last row;
- backup/restore controls remain reachable on mobile;
- row tap targets navigate correctly on mobile.

Console assertions:

- no `next/router` App Router error;
- no `window is not defined`;
- no `localStorage is not defined`;
- no hydration mismatch caused by client-only storage state;
- no unhandled promise rejection during worker/auth failure;
- no uncaught `JSON.parse` error from corrupted storage;
- no access token, refresh token, OAuth code, or transient cookie value appears in console logs.

Manual smoke:

- Run OAuth with a safe MAL test account after mocked tests pass.
- Verify first login imports the real MAL lists.
- Verify logout clears local list display.
- Verify installed PWA/mobile viewport bottom nav does not overlap list content.

## Edge Cases To Watch

- `localStorage.getItem(...)` returns null for one category.
- Stored value is valid JSON but wrong shape.
- Stored map pair ID does not match `item.node.id`.
- Stored item is missing `node`, `node.id`, or `list_status`.
- Storage access throws because browser privacy mode blocks it.
- Session storage contains old `activetab` values from Pages Router.
- Sort state from one tab leaks into another tab.
- Infinite scroll slice count persists after logout or restore.
- `slicearr` is `"0"`, negative, decimal, very large, or non-numeric.
- `sorted_anime` belongs to a different tab than `activetab`.
- `sort_type` is raw legacy text, JSON-stringified text, unknown text, malformed JSON, `null`, or empty string.
- Active tab changes by keyboard or programmatic value update instead of click.
- Swipe starts on a row link, menu button, dialog, file input, or scrollable tab strip.
- Infinite scroll fires multiple times while already at the bottom.
- Worker starts globally and route-owned sync starts at the same time.
- Worker starts twice under React Strict Mode.
- Worker receives 401 during the third status fetch.
- Two workers receive 401 at the same time and race refresh.
- Worker category is genuinely empty versus failed and empty.
- Worker returns success for some categories and failure for others.
- Worker fetch returns 429, 5xx, malformed JSON, missing `data`, or malformed `paging.next`.
- Worker pagination never receives `paging.next === undefined`.
- Worker posts a message after route unmount or logout.
- Refresh succeeds while a worker request is already retrying.
- Refresh succeeds but the server cannot set a new refresh token.
- Refresh fails and local data should remain intact.
- User navigates away while worker is running.
- Worker script is blocked or unavailable.
- Worker returns a plain object or serialized array instead of `Map` instances.
- One MAL status endpoint returns malformed JSON while previous statuses succeeded.
- `expires_in` cookie is malformed, missing, expired, or far in the future.
- `user_data` cookie is malformed or omitted because it exceeded cookie size limits.
- Profile `joined_at` is invalid or missing.
- Profile `anime_statistics` is missing, null, or malformed.
- Completed list has fewer than 10 entries, tied scores, score `0`, missing scores, or mixed corrupted entries.
- Backup file contains an older schema.
- Backup file has more than five category arrays.
- Backup restore has valid early categories and malformed later categories.
- Restore selected file has empty MIME type but `.json` extension.
- Restore is cancelled before file selection.
- Restore is attempted twice with the same file.
- `localStorage.setItem` throws during backup, restore, or worker persistence.
- Download object URL is not revoked.
- Mobile swipe conflicts with horizontal tab-list scrolling.
- Fixed top nav or bottom mobile nav overlaps first or last list row.
- Logout happens in one tab while another tab has an in-flight sync.
- Logout then login again happens without a full browser reload.
- Access tokens, refresh tokens, OAuth codes, or transient cookie values leak into UI text, storage, URLs, toasts, or logs.

## Validation Commands

Run before marking the task complete:

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e -- --grep "mylist|login|logout|profile|worker"
```

If the grep pattern does not match the local Playwright test names, run the targeted My List/auth spec files directly.
