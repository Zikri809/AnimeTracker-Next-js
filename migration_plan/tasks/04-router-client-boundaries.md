# Task 04: Router APIs and Client Boundaries

## Purpose

Prepare shared components and utilities for App Router by replacing Pages Router APIs and marking browser-only code as Client Components.

## Requirements

- Replace `next/router` usage in shared code before migrating route files.
- Keep current URLs and navigation behavior.
- Isolate browser-only utilities so Server Components never import them.
- Preserve scroll restoration and session state behavior where users already rely on it.

## Specific Tasks

- Audit all imports of `next/router`.
- Replace with App Router APIs:
  - `useRouter` from `next/navigation`.
  - `useParams`.
  - `usePathname`.
  - `useSearchParams`.
- Create small adapter hooks if needed:
  - current pathname plus query string.
  - previous-route save and restore.
  - dynamic params normalization.
- Rewrite `src/Utility/ScrollSaver.js` without `router.events`.
- Update shared components:
  - mobile navbar.
  - search navbar.
  - detail navbar.
  - tracking form navbar.
  - mylist navbar.
  - add-to-watchlist button.
  - anime horizontal card if it uses routing or window size.
- Add `"use client"` to all components that use hooks, browser APIs, DOM refs, workers, or event handlers.
- Move browser-only utility imports out of Server Component paths.

## Deliverables

- Router-ready shared components.
- App Router compatible scroll/save helper.
- Documented list of remaining route-file-only router changes.
- Client boundary audit notes.

## Definition of Done

- Shared components no longer import `next/router`.
- No shared component that uses hooks lacks `"use client"`.
- Existing Pages Router routes still work or have a documented temporary compatibility wrapper.
- Navigation, back links, and save/delete return paths match baseline.

## Testing

- Vitest:
  - path builder helpers.
  - search query sanitization.
  - tracking back-link calculation.
  - scroll storage helper behavior with mocked storage.
- Playwright:
  - submit search from nav.
  - navigate from list to detail and back.
  - open tracking form and return to detail.
  - verify scroll position after back navigation.

## Edge Cases to Watch

- `router.asPath.split(...)` behavior when query strings exist.
- Missing dynamic params on first render no longer applying because App Router params are immediately available.
- Replacing `router.reload()` with `router.refresh()` when a full browser reload is actually needed for localStorage state.
- `useSearchParams()` requiring Suspense in some static contexts.
- Back-link generation for relation tracking routes.
- Paths with encoded search titles.
- Session storage from old routes pointing to no-longer-existing paths.
