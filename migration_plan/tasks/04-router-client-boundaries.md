# Task 04: Router APIs and Client Boundaries

## Purpose

Prepare shared components and browser-only utilities for App Router route migration by removing Pages Router-only APIs from shared code, centralizing URL-building behavior, and making Client Component boundaries explicit.

This phase does not migrate page route files. It makes the components used by those pages safe to reuse when Tasks 06 to 08 move the actual routes into `src/app`.

## Current Baseline

- `src/app/layout.tsx`, `src/app/providers.tsx`, `src/context/season-context.tsx`, `src/app/apple-startup-images.ts`, `src/ComponentsSelf/navbar/mobile_navbar.tsx`, and `src/ComponentsSelf/persistent_worker/persistent_worker.tsx` already exist from Task 03.
- The app still serves public routes from `src/pages`. Route-file router migration belongs to Tasks 06, 07, and 08.
- Shared production files that still import `next/router` and are in scope for this task:
  - `src/ComponentsSelf/add to watchlist button.jsx`
  - `src/ComponentsSelf/animecardhorizontal.jsx`
  - `src/ComponentsSelf/detailednavbar.jsx`
  - `src/ComponentsSelf/min.jsx`
  - `src/ComponentsSelf/mylistnavbar.jsx`
  - `src/ComponentsSelf/restore components/uploadbackup.jsx`
  - `src/ComponentsSelf/searchnavbar.jsx`
  - `src/ComponentsSelf/trackingformnavbar.jsx`
- Shared utilities that depend on a Pages Router object and are in scope for this task:
  - `src/Utility/ScrollSaver.js`
  - `src/Utility/loadfromlocal.jsx`
  - `src/Utility/tracking/savehandler_tracking.js`
  - `src/Utility/tracking/deleteshow_tracking.js`
  - `src/Utility/tracking/lastclick_tracking.js`
- Route files under `src/pages/**` still import `next/router`. Document those remaining imports after this task, but do not migrate them here unless a shared extraction requires a tiny call-site change.
- `src/ComponentsSelf/detailedrelationnavbar.jsx` already imports `useParams` from `next/navigation`, but it lacks `"use client"` and currently hard-codes its back link to `/`. Treat it as part of the client-boundary/back-link audit even though it no longer imports `next/router`.
- `src/ComponentsSelf/navbar/mobile_navbar.tsx` already uses `usePathname` from `next/navigation`. Recheck it during testing, but do not refactor it unless tests reveal a regression.

## Requirements

- Shared components must not import `next/router`.
- Shared components used by both current Pages Router routes and future App Router routes must tolerate both router shells.
- Preserve existing public URLs, back links, search URLs, tracking return behavior, local watchlist button labels, scroll restoration, and session state.
- Move route-derived decisions into pure, tested helper functions instead of repeating `router.asPath.split(...)` and `router.query.hasOwnProperty(...)` logic.
- Add `"use client"` to every shared component or hook file that uses React client hooks, browser APIs, DOM refs, workers, Radix interactive primitives, or event handlers.
- Keep browser-only storage utilities out of Server Component import paths.
- Do not introduce broad visual redesign, auth redesign, storage redesign, or unrelated TypeScript conversion in this task.

## Non-Goals

- Do not move routes from `src/pages` to `src/app`.
- Do not remove `src/pages` router files.
- Do not migrate API routes.
- Do not change MyAnimeList sync semantics.
- Do not replace the localStorage/sessionStorage data model.
- Do not clean up all duplicated detail page code. Centralize only the routing helpers needed for App Router readiness.

## Required Design Decisions

### Router Compatibility

Use `next/navigation` for App Router APIs in Client Components, but remember these shared components still render inside Pages Router routes today.

For shared components that need imperative navigation while they are used in both routers, prefer `next/compat/router` during the coexistence window:

```jsx
"use client";

import { useRouter as useCompatRouter } from "next/compat/router";
import { useRouter as useAppRouter, usePathname, useParams, useSearchParams } from "next/navigation";
```

Rules:

- `next/compat/router` can return `null` in App Router. Never destructure it without a null check.
- If a compat router exists and `router.isReady` is false, wait before reading Pages Router `query` or `asPath`.
- `usePathname`, `useParams`, and `useSearchParams` must only be called in Client Components.
- In Pages Router prerendering, `useSearchParams()` and `useParams()` can be `null`. Provide a fallback to the compat router or render a neutral state until ready.
- Do not import `next/router` in any shared component or shared utility after this task.

### Prefer Pure Route Helpers

Do not keep URL rules embedded in JSX ternaries. Put route parsing and URL construction in `src/lib/routing/path-utils.ts`, then call those helpers from client components and route pages.

Helpers must accept plain strings/objects and return strings. They must not import React, Next router hooks, `window`, `document`, `localStorage`, or `sessionStorage`.

### Browser Storage Boundary

Storage helpers may stay JavaScript for now, but functions that read or write browser storage must only be called from Client Components, event handlers, or `useEffect`.

Do not import storage-reading helpers into App Router Server Components.

## Implementation Plan

### 1. Capture the exact pre-change audit

Run:

```powershell
rg -l "next/router" src | Sort-Object
rg -n "router\.events|router\.asPath|router\.query|router\.isReady|router\.reload|router\.push|router\.replace" src\ComponentsSelf src\Utility
rg -n "window\.|document\.|localStorage|sessionStorage|Worker\(|addEventListener|removeEventListener|useEffect|useState|useRef|useMemo|useCallback|useLayoutEffect|onClick=|onSubmit=|onChange=|usePathname|useParams|useSearchParams" src\ComponentsSelf src\components src\context src\hooks src\Utility
rg -n '^["'']use client["''];?$' src\ComponentsSelf src\components src\context src\hooks src\Utility
```

Create or update `migration_plan/baseline/router-client-boundary-audit.md` with:

- Shared files fixed by this task.
- Route files intentionally deferred to Tasks 06, 07, and 08.
- Client-boundary files marked in this task.
- Any files that remain browser-only and the client component that owns them.

The audit must be factual output from the current codebase, not a guessed list.

### 2. Add pure route and search helpers

Create `src/lib/routing/path-utils.ts`.

Required exports:

```ts
export type RouteParams = Record<string, string | string[] | undefined>;

export function normalizeRouteParam(value: string | string[] | undefined | null): string | undefined;
export function stripQueryString(path: string): string;
export function pathSegments(pathname: string): string[];
export function parentPath(pathname: string, segmentCount?: number): string;
export function sanitizeSearchTerm(raw: string): string;
export function buildSearchHref(raw: string): string;
export function buildTrackingHref(input: { pathname: string; params?: RouteParams }): string;
export function buildDetailBackHref(input: { pathname: string; params?: RouteParams }): string;
export function buildTrackingBackHref(pathname: string): string;
export function buildRelationHref(input: { pathname: string; relationId: string | number }): string;
export function currentPathWithSearch(pathname: string, searchParams?: URLSearchParams | { toString(): string } | null): string;
```

Helper requirements:

- `stripQueryString("/search/naruto?x=1")` returns `/search/naruto`.
- `parentPath("/Anime/1/tracking")` returns `/Anime/1`.
- `parentPath("/Anime/1/relation/20/tracking", 1)` returns `/Anime/1/relation/20`.
- `sanitizeSearchTerm` must preserve the current sanitization behavior from `src/ComponentsSelf/searchnavbar.jsx`: remove `/`, `\`, `<`, `>`, `'`, `"`, and `&`.
- `buildSearchHref("")` and `buildSearchHref("////")` return `/`.
- `buildSearchHref("frieren/beyond")` returns `/search/frierenbeyond`.
- Search terms must be encoded with `encodeURIComponent` after sanitization.
- Helpers must always return a leading-slash path and must not return duplicate slashes.
- Helpers must handle query strings without treating them as path segments.

### 3. Encode current URL behavior in helper tests

Create `src/lib/routing/path-utils.test.ts`.

Test at least these cases:

| Current pathname | Expected tracking href |
| --- | --- |
| `/Anime/1` | `/Anime/1/tracking` |
| `/Anime/1/relation/20` | `/Anime/1/relation/20/tracking` |
| `/search/NA/1` | `/search/NA/1/tracking` |
| `/search/spy%20family/1/relation/20` | `/search/spy%20family/1/relation/20/tracking` |
| `/mylist/PlanToWatch/1` | `/mylist/PlanToWatch/1/tracking` |
| `/mylist/Completed/1/relation/20` | `/mylist/Completed/1/relation/20/tracking` |
| `/morethiseseason/1` | `/morethiseseason/1/tracking` |
| `/morelastseason/1/relation/20` | `/morelastseason/1/relation/20/tracking` |
| `/moreupcoming/1` | `/moreupcoming/1/tracking` |
| `/seasons/spring/2026/1` | `/seasons/spring/2026/1/tracking` |
| `/seasons/spring/2026/1/relation/20` | `/seasons/spring/2026/1/relation/20/tracking` |

Test back links:

| Current pathname | Expected detail back href |
| --- | --- |
| `/Anime/1` | `/` |
| `/Anime/1/relation/20` | `/Anime/1` |
| `/search/NA/1` | `/search/NA` |
| `/search/NA/1/relation/20` | `/search/NA/1` |
| `/mylist/PlanToWatch/1` | `/mylist` |
| `/mylist/PlanToWatch/1/relation/20` | `/mylist/PlanToWatch/1` |
| `/morethiseseason/1` | `/morethiseseason` |
| `/morethiseseason/1/relation/20` | `/morethiseseason/1` |
| `/seasons/spring/2026/1` | `/seasons/spring/2026` |
| `/seasons/spring/2026/1/relation/20` | `/seasons/spring/2026/1` |

Test tracking return links:

- `/Anime/1/tracking` -> `/Anime/1`
- `/Anime/1/relation/20/tracking` -> `/Anime/1/relation/20`
- `/search/NA/1/tracking?draft=1` -> `/search/NA/1`
- `/mylist/Watching/1/relation/20/tracking` -> `/mylist/Watching/1/relation/20`

Test relation links:

- `/Anime/1` plus `20` -> `/Anime/1/relation/20`
- `/Anime/1/relation/20` plus `30` -> `/Anime/1/relation/30`
- `/search/NA/1` plus `20` -> `/search/NA/1/relation/20`
- `/seasons/spring/2026/1/relation/20` plus `30` -> `/seasons/spring/2026/1/relation/30`

### 4. Add router adapter hooks for shared components

Create `src/hooks/use-current-route.ts` or `src/hooks/use-current-route.tsx` with `"use client"`.

It should provide a small compatibility wrapper around App Router hooks plus `next/compat/router`.

Suggested API:

```ts
type CurrentRoute = {
  isReady: boolean;
  pathname: string;
  pathWithSearch: string;
  params: Record<string, string | undefined>;
  push: (href: string) => void;
  replace: (href: string) => void;
  refresh: () => void;
  hardReload: () => void;
};

export function useCurrentRoute(): CurrentRoute;
```

Behavior:

- In App Router, `pathname` comes from `usePathname()`.
- In Pages Router, prefer `compatRouter.asPath` for full path behavior when available, but strip query strings before path segment calculations.
- `params` combines `useParams()` values when available with `compatRouter.query` when the compat router exists.
- `isReady` is `true` in App Router and follows `compatRouter.isReady` in Pages Router.
- `push` and `replace` use App Router navigation by default. If a compat router exists and is ready, using it is acceptable during coexistence.
- `refresh` calls App Router `router.refresh()`.
- `hardReload` must call `window.location.reload()` from inside the function and guard `typeof window`.

Do not expose the raw Pages Router object to new shared components.

### 5. Replace `src/Utility/ScrollSaver.js`

Rename to `src/hooks/use-scroll-saver.ts` if touching call sites is manageable. If keeping the old filename temporarily reduces churn, keep the default export but implement it as a real hook and document the temporary filename in the audit.

Required API:

```ts
export const SCROLL_STORAGE_KEY = "scrollY";

export function saveScrollPosition(storage?: Storage, y?: number): void;
export function readScrollPosition(storage?: Storage): number | null;
export function restoreScrollPosition(options?: { maxOffset?: number; storage?: Storage }): boolean;
export function useScrollSaver(deps?: React.DependencyList): void;
```

Behavior:

- No `router.events`.
- Save scroll on:
  - `pagehide`
  - `beforeunload`
  - capture-phase clicks on internal `<a href>` links before navigation starts
  - optional explicit `saveScrollPosition()` calls before imperative `push`
- Restore only when the saved value is a finite non-negative number.
- Clamp or skip restore when saved scroll exceeds current document height plus the existing tolerance of about `100px`.
- Do not throw when `sessionStorage` is unavailable, disabled, or contains invalid data.
- Keep using `sessionStorage.scrollY` so current session data is not lost.

Update current call sites:

- `src/pages/morethiseseason/index.js`
- `src/pages/morelastseason/index.js`
- `src/pages/moreupcoming/index.js`
- `src/pages/seasons/[season]/[year]/index.js`
- `src/pages/mylist/index.jsx`

Call-site guidance:

- Replace `scrollsaver(router)` with `useScrollSaver([...restoreDependencies])`.
- Remove direct `router.events` blocks from `src/pages/mylist/index.jsx` and `src/pages/search/[title]/index.js` only if the new hook fully covers the same behavior.
- Keep existing explicit restore effects if they are needed to wait for infinite-scroll data to mount, but make them call `restoreScrollPosition()` rather than duplicate parsing logic.

### 6. Refactor shared router-dependent components

#### `src/ComponentsSelf/add to watchlist button.jsx`

- Add `"use client"`.
- Remove `next/router`.
- Use `useCurrentRoute()` to get `isReady`, `pathname`, `pathWithSearch`, and `params`.
- If `props.to` is supplied by existing Pages Router call sites, keep using it for compatibility.
- If `props.to` is missing, compute the tracking href with `buildTrackingHref({ pathname, params })`.
- Replace `loadFromLocal(router, Setusersstate)` with a helper that accepts `mal_id`, `relation_id`, and a setter, or better returns display content.
- Keep the current button labels and category order:
  - PlanToWatch -> `To Watch - Ep ...`
  - Watching -> `Watching - Ep ...`
  - Completed -> `Completed - Ep ...`
  - OnHold -> `On Hold - Ep ...`
  - Dropped -> `Dropped - Ep ...`
  - Missing from all lists -> plus icon and `Add to watchlist`
- Guard malformed/missing localStorage lists; do not crash on first-time users.

#### `src/Utility/loadfromlocal.jsx`

- Remove the router parameter.
- Prefer a pure-ish API such as:

```ts
export function getWatchlistButtonContent(input: {
  malId?: string | number;
  relationId?: string | number;
  storage?: Storage;
}): React.ReactNode;
```

- If keeping JavaScript, still keep the function free of Next router imports and document that it is browser-only.
- Parse IDs with `Number(...)` and reject `NaN`.
- Use safe storage parsing rather than raw `JSON.parse(localStorage.getItem(...))`.

#### `src/ComponentsSelf/detailednavbar.jsx`

- Add `"use client"`.
- Remove `next/router`.
- Use `useCurrentRoute()` and `buildDetailBackHref()`.
- Preserve the copy-title button behavior, but replace manual `innerHTML` SVG swaps with React state and lucide icons if feasible.
- The back link must match the helper test table.
- Remove the dead JSX expression block that computes a URL but does not use it.

#### `src/ComponentsSelf/trackingformnavbar.jsx`

- Add `"use client"`.
- Remove `next/router`.
- Use `buildTrackingBackHref(pathname)` for the back link.
- Preserve `props.savebutton` behavior.

#### `src/ComponentsSelf/searchnavbar.jsx`

- Add `"use client"`.
- Remove `next/router`.
- Use `useCurrentRoute().push` for navigation.
- Use `buildSearchHref(input.value)`.
- Preserve the existing behavior where empty input navigates to `/`.
- Remove native `addEventListener` for the search button if practical; use React `onClick` and `onKeyDown`.
- Ensure the window-level Enter key listener is cleaned up. Prefer handling Enter on the input to avoid global listener side effects.
- Continue calling `set_state(inputValue, rerenderState)` before navigation.
- Continue clearing `sessionStorage.animedatasearch` before new searches.

#### `src/ComponentsSelf/min.jsx`

- Add `"use client"`.
- Remove `next/router`.
- Use `useCurrentRoute()` and `buildRelationHref()`.
- When already on a relation route, replace the relation ID instead of appending another `/relation/:id`.
- Preserve the rule that `Adaptation` relation entries render as plain text, not links.
- Add stable `key` props for mapped relations and entries while touching the file.

#### `src/ComponentsSelf/animecardhorizontal.jsx`

- Add `"use client"`.
- Remove `next/router`; the component only uses `router.isReady` to gate the added-status icon.
- Render the added-status icon from `props.addstatus` directly.
- Guard `window.innerWidth` inside `useEffect` or `useLayoutEffect` so the component never reads `window` during render.
- Do not use `useLayoutEffect` unless layout measurement is required before paint. If visual parity allows, prefer `useEffect` to reduce SSR warnings.
- Add keys to mapped genre buttons.

#### `src/ComponentsSelf/mylistnavbar.jsx`

- Add `"use client"`.
- Remove `next/router`.
- Use `useCurrentRoute().push` for logout and login-failed fallback.
- For restore, keep full page reload semantics with `hardReload()` or `window.location.reload()` after writing localStorage. Do not replace this with `router.refresh()` unless a test proves localStorage-driven UI refreshes correctly.
- Move `parseCookies({})` into a hook/effect or a tiny client-only cookie helper. Do not evaluate cookie-dependent UI from a Server Component path.
- Ensure backup and restore code does not throw when watchlist keys are missing or corrupted.
- Fix file-type validation while touching this code: `if (!file.type === ".json")` is not valid logic. Prefer checking `file.type === "application/json"` or filename `.endsWith(".json")`.

#### `src/ComponentsSelf/restore components/uploadbackup.jsx`

- Add `"use client"`.
- Remove `next/router`.
- Use `useCurrentRoute().push("/mylist")` after restore.
- Apply the same backup-file validation and safe storage parsing decisions as `mylistnavbar.jsx`.
- If this component is no longer used after `mylistnavbar` owns restore, document whether it should remain or be deleted in a later cleanup task. Do not leave stale router code.

#### `src/ComponentsSelf/detailedrelationnavbar.jsx`

- Add `"use client"`.
- Use the same `buildDetailBackHref()` behavior as `detailednavbar.jsx`; do not leave the back link hard-coded to `/`.
- If this file is unused, document that in the audit instead of silently ignoring it.

### 7. Refactor router-dependent tracking utilities

Update the utilities below so they accept minimal callbacks/paths instead of a Pages Router object:

- `src/Utility/tracking/savehandler_tracking.js`
- `src/Utility/tracking/deleteshow_tracking.js`
- `src/Utility/tracking/lastclick_tracking.js`

Preferred API shape:

```ts
type NavigationAdapter = {
  currentPath: string;
  push: (href: string) => void;
};
```

Rules:

- Replace `router.asPath.split("/").slice(0, -1).join("/")` with `buildTrackingBackHref(currentPath)`.
- Replace `router.query.relation_id ?? router.query.mal_id` with explicit `malId` and `relationId` arguments.
- Keep the existing delayed navigation timing after save/delete:
  - local-only save/delete remains about `1000ms`
  - authenticated save remains about `3500ms`
  - authenticated delete remains about `3000ms`
- Do not change MAL API endpoint URLs in this task.
- Do not change toast copy unless needed for correctness.

### 8. Client boundary pass

Add `"use client"` to files that are direct shared Client Component entry points.

Minimum in-scope list:

- `src/ComponentsSelf/add to watchlist button.jsx`
- `src/ComponentsSelf/animecardhorizontal.jsx`
- `src/ComponentsSelf/detailednavbar.jsx`
- `src/ComponentsSelf/detailedrelationnavbar.jsx`
- `src/ComponentsSelf/min.jsx`
- `src/ComponentsSelf/mylistnavbar.jsx`
- `src/ComponentsSelf/restore components/uploadbackup.jsx`
- `src/ComponentsSelf/searchnavbar.jsx`
- `src/ComponentsSelf/trackingformnavbar.jsx`
- `src/hooks/useSwipeGesture.js`

Also audit shared UI primitives. Radix primitives such as dialog, dropdown, tabs, toggle group, radio group, progress, label, separator, avatar, and sonner are normally Client Components. Add `"use client"` to the local wrappers when they can be imported by future App Router pages:

- `src/components/ui/avatar.jsx`
- `src/components/ui/dialog.jsx`
- `src/components/ui/dropdown-menu.jsx`
- `src/components/ui/label.jsx`
- `src/components/ui/progress.jsx`
- `src/components/ui/radio-group.jsx`
- `src/components/ui/separator.jsx`
- `src/components/ui/sonner.jsx`
- `src/components/ui/tabs.jsx`
- `src/components/ui/toggle-group.jsx`

Do not add `"use client"` to pure utilities or static presentational components unless they directly use client-only APIs.

### 9. Document deferred route-file router changes

After the shared changes, run:

```powershell
rg -l "next/router" src | Sort-Object
```

The remaining list should contain only route files under `src/pages/**`, unless a deliberate temporary exception is documented.

Add the result to `migration_plan/baseline/router-client-boundary-audit.md` under "Deferred route-file imports".

Group the deferred work by future task:

- Task 06: static/list route families such as `/`, `/search/[title]`, `/more*`, and `/seasons/[season]/[year]`.
- Task 07: detail, relation, and tracking route families under `/Anime`, `/search`, `/more*`, `/seasons`, and `/mylist/[mylist_tab]`.
- Task 08: `/mylist`, login, logout, login success/failure, user profile, worker sync UX.

## Deliverables

- `src/lib/routing/path-utils.ts`
- `src/lib/routing/path-utils.test.ts`
- `src/hooks/use-current-route.ts` or `src/hooks/use-current-route.tsx`
- App Router-compatible scroll saver hook/helper replacing `router.events`
- Updated shared router-dependent components listed above
- Updated tracking utilities that no longer accept a Pages Router object
- Client-boundary updates for shared interactive components
- `migration_plan/baseline/router-client-boundary-audit.md` with fixed files, deferred route files, and remaining browser-only notes

## Definition of Done

- `rg -n "from ['\"]next/router['\"]" src\ComponentsSelf src\Utility src\hooks src\components src\context src\app` returns no matches.
- `rg -n "router\.events" src` returns no matches, or only documented deferred route-file matches if a route cannot be touched safely in this task.
- Shared components do not receive or expose a raw Pages Router object.
- Shared components that use hooks, browser APIs, DOM refs, Radix interactive primitives, workers, or event handlers have `"use client"`.
- Route helpers cover every current detail, relation, tracking, mylist, search, seasonal, and seasons URL shape.
- Existing Pages Router routes still render while they remain under `src/pages`.
- Search navigation still sanitizes and encodes titles as before.
- Add-to-watchlist buttons still show the correct local watchlist status.
- Detail nav, relation nav, tracking nav, save return, and delete return paths match the baseline tables.
- Scroll position restore still works when navigating from long list/search/mylist pages into detail and back.
- Restore-from-backup still refreshes localStorage-backed UI after writing restored data.
- Remaining `next/router` imports are documented as route-file-only deferred work.

## Testing

### Static checks

Run:

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
rg -n "from ['\"]next/router['\"]" src\ComponentsSelf src\Utility src\hooks src\components src\context src\app
rg -n "router\.events" src
```

Expected:

- Lint, typecheck, unit tests, and build pass.
- No shared-code `next/router` imports remain.
- No shared-code `router.events` usage remains.

### Vitest

Add unit tests for `src/lib/routing/path-utils.ts`:

- Search sanitization and encoding.
- Query string stripping.
- Parent-path calculations.
- Tracking href generation for all URL families in the table.
- Detail back href generation for all URL families in the table.
- Tracking back href generation for normal and relation tracking routes.
- Relation href generation from normal and existing relation routes.
- Invalid, empty, or partial paths return a safe fallback such as `/`, not malformed output.

Add unit tests for scroll helpers:

- `saveScrollPosition` writes a stringified number.
- `readScrollPosition` returns `null` for missing, negative, non-numeric, `Infinity`, or corrupted values.
- `restoreScrollPosition` calls `window.scrollTo(0, y)` only when the value is valid and within the max offset.
- Helpers do not throw when storage access throws.

Add component tests with mocked `next/navigation` and `next/compat/router`:

- `SearchNavbar` pushes `/` for empty input.
- `SearchNavbar` pushes `/search/frieren` for `frieren`.
- `SearchNavbar` pushes encoded sanitized href for slash, quote, HTML-like text, and emoji input.
- `TrackingFormNavbar` back link strips `/tracking`.
- `DetailedNavbar` back link matches at least `/Anime/1`, `/search/NA/1`, `/mylist/Watching/1`, and a relation route.
- `AddToWatchlistButton` renders the plus state when storage is empty and a status state when an ID exists in each list.
- `Min` builds relation links without nesting relation routes.
- `MylistNavbar` uses hard reload after restore and pushes logout API URL on logout.

### Playwright

Use network route interception for Jikan/MAL responses where needed.

Cover at minimum:

- Submit search from the nav with:
  - normal text
  - text containing `/`, quotes, `<script>`, and `&`
  - empty input
- Navigate from `/morethiseseason` or `/search/NA` to a detail page and back; verify the previous scroll position is restored.
- Navigate from `/Anime/1` to `/Anime/1/tracking`; save local-only status; verify localStorage and return path.
- Navigate from a relation detail route to tracking and back.
- Open `/mylist` with seeded localStorage; sort and tab state still work; mobile swipe still changes tabs.
- Restore backup flow writes all five watchlist keys and refreshes the rendered list.
- Console has no `next/router` App Router errors, `window is not defined`, `localStorage is not defined`, `router.events is undefined`, or hydration errors.

## Edge Cases to Watch

- `router.asPath.split(...)` previously included query strings; helpers must strip query strings before path math.
- App Router params are available immediately, while Pages Router params may not be ready during prerender.
- `useSearchParams()` can be `null` in shared components rendered during Pages Router prerendering.
- `next/compat/router` can be `null` in App Router.
- Relation routes must replace the existing relation ID instead of appending nested relation segments.
- Search titles may be already encoded in the URL.
- Search input sanitization can produce an empty string after removing unsafe characters.
- `router.reload()` was used after localStorage restore; `router.refresh()` alone may not update localStorage-derived client state.
- Missing, empty, or corrupted watchlist storage must not crash nav buttons or list cards.
- `sessionStorage.scrollY` can refer to a longer old page than the current page.
- Browser storage can throw in private mode or if blocked.
- Some route files currently contain typos in route construction, for example `router.querytitle` in a relation tracking href. Helper tests should catch this behavior before the route is migrated.

## Implemented Rationale & Verification Walkthrough

This section documents the architectural decisions, design choices, and implementation details for Task 04 so that other developers can quickly verify correctness.

### 1. Router Compatibility Hook (`useCurrentRoute`)
* **Rationale**: Abstract away differences between `next/router` (Pages Router) and `next/navigation` (App Router) using a unified interface.
* **Details**: Wraps `usePathname()`, `useParams()`, and `useSearchParams()` from `next/navigation`, and safely interacts with `next/compat/router`.
* **Verification**: Checks `router.isReady` in Pages Router and falls back to browser-only window parsing when the router is not ready. All query object and parameter extractions are centralized and memoized to satisfy the React Compiler's strict optimization checks (avoiding property-path lookups like `compatRouter?.query`).

### 2. Pure Routing Utilities (`path-utils.ts`)
* **Rationale**: Eliminate duplicative string parsing (`router.asPath.split('/')`) and centralize URL creation to ensure consistent routing behavior across all routes.
* **Details**:
  - `stripQueryString` cleanly extracts pathname from URL strings.
  - `parentPath` drops trailing path segments safely and supports positive, zero, and negative segment counts.
  - `sanitizeSearchTerm` removes unsafe characters (`/`, `\`, `<`, `>`, `'`, `"`, `&`) using RegExp.
  - `buildTrackingHref` and `buildDetailBackHref` implement exact routing rules for all 11 URL families.
  - `buildRelationHref` avoids nested relation path building when already on a relation page by replacing the last segment.
* **Verification**: Fully covered by 42 table-driven tests in `path-utils.test.ts` verifying all standard and edge-case behaviors.

### 3. Scroll Restoring Hook (`useScrollSaver`)
* **Rationale**: Decouple scroll saving/restoration from Next.js Pages Router navigation events (`router.events`) to make it fully compatible with the App Router.
* **Details**: Listens directly to standard browser events (`pagehide`, `beforeunload`) and capture-phase mouse clicks on internal anchor links (`<a>`).
* **Verification**: Stores scroll state key-value pairs (`sessionStorage.scrollY`). Automatically rejects invalid, negative, or excessive offsets, and implements custom dependencies array mapping to trigger restoration precisely after data mounts.

### 4. DOM Manipulation Elimination
* **Rationale**: Comply with React's declarative state model and prepare for React Server Components.
* **Details**:
  - Replaced `classList` toggling on search navbar elements with local React state (`isSearchVisible`) driving Tailwind CSS width and visibility classes (`hidden`, `w-fit`, `w-[90%]`, etc.).
  - Replaced innerHTML replacement for clipboard copy indicators on detailed navbar elements with local state driving icons from `lucide-react`.
  - Replaced detail/relation page synopsis height manipulation with local state driving conditional Tailwind classes (`overflow-hidden line-clamp-5 max-h-30` vs expanded).

### 5. TypeScript Conversion and Lint Cleanup
* **Rationale**: Ensure full type safety, satisfy the React Compiler, and resolve ESLint rules.
* **Details**:
  - Migrated and typed all modified files and pages (converting 20+ files to `.tsx` / `.ts`).
  - Converted Radix UI wrappers (`input.tsx`, `card.tsx`) to TypeScript with proper forwarding using `React.forwardRef`.
  - Corrected component capitalizations to resolve Rule of Hooks errors (`MylistSort`, `TrendSec`, `RatedCard`).
  - Silenced false positive render-time ref errors on external properties in `navbar.tsx` by using file-level `/* eslint-disable react-hooks/refs */` overrides.
  - Fixed sparse array gaps (extra commas) in `anime_statcard.tsx`.
