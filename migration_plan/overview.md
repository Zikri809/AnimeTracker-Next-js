# AnimeTracker Next.js App Router and TypeScript Migration Plan

## Objective

Migrate AnimeTracker from the current Pages Router JavaScript codebase to the latest stable Next.js App Router with TypeScript while preserving the existing UI, behavior, URLs, local watchlist data, MyAnimeList sync, PWA assets, and deployment behavior.

This is a behavior-preserving migration first. Visual redesign, storage redesign, and API contract cleanup should be deferred unless they are required to complete the migration safely.

## Current Snapshot

- Framework: `next@15.3.8` declared in `package.json`; latest npm version checked on 2026-05-26 was `next@16.2.6`.
- Runtime: local Node version is compatible with Next 16 requirements.
- Router: fully Pages Router under `src/pages`; no `src/app` directory exists.
- Language: 63 `.js` files, 79 `.jsx` files, no `.ts` or `.tsx` files.
- State and persistence: browser `localStorage` and `sessionStorage`, plus MyAnimeList OAuth cookies.
- API layer: 11 API routes under `src/pages/api`.
- Testing: no meaningful automated test suite currently exists.
- Styling: Tailwind v4 CSS-first setup in `src/styles/globals.css`; no `tailwind.config.*`.

## Guiding Principles

1. Preserve public URLs and user-visible behavior before improving internals.
2. Keep browser-only features in Client Components until a storage redesign is explicitly approved.
3. Migrate route groups incrementally and avoid duplicate matching paths in `pages` and `app`.
4. Use typed boundaries where risk is highest first: route params, API route handlers, environment variables, storage parsing, and external API payloads.
5. Add tests before or alongside risky migration work, not after the migration is complete.
6. Keep the existing visual language intact: black background, fixed nav offsets, mobile bottom nav, Poppins styling, carousel sizing, list spacing, skeleton states, and PWA splash/manifest behavior.

## Phase Index

1. [Baseline and Safety Net](tasks/01-baseline-and-safety-net.md)
2. [Framework, Tooling, and TypeScript Foundation](tasks/02-framework-tooling-typescript.md)
3. [App Router Shell and Providers](tasks/03-app-router-shell-providers.md)
4. [Router APIs and Client Boundaries](tasks/04-router-client-boundaries.md)
5. [API Route Handlers, Auth, and Data Proxies](tasks/05-api-route-handlers-auth-data.md)
6. [Static and List Page Migration](tasks/06-static-list-pages.md)
7. [Anime Detail, Relation, and Tracking Routes](tasks/07-detail-tracking-route-families.md)
8. [My List, Worker Sync, and Auth UX](tasks/08-mylist-worker-auth-flows.md)
9. [Hardening, Cleanup, and Release](tasks/09-hardening-release.md)

Testing is detailed in [testing_strategy.md](testing_strategy.md).

## Suggested Branching

- Use one branch per phase, prefixed with `codex/`, for example `codex/migration-01-baseline`.
- Merge only when that phase's definition of done is satisfied.
- Avoid starting page route migrations before the shell, TypeScript foundation, and router helper work are merged.

## Global Definition of Done

The migration is complete when:

- The app runs on the latest stable Next.js and React versions selected at implementation time.
- All user-facing routes are served from `src/app`.
- All API routes are served from `src/app/api/**/route.ts`.
- `src/pages` is removed or contains only intentionally retained temporary compatibility files.
- TypeScript is enabled and CI blocks on `tsc --noEmit`.
- Vitest covers pure utilities, data transformation, route-handler helpers, validation, and storage edge cases.
- Playwright covers core user journeys on desktop and mobile.
- Existing URLs, local watchlist behavior, MAL login/sync behavior, PWA assets, and key UI layouts are preserved.
- Build, lint, typecheck, unit tests, and Playwright smoke tests pass in CI.

## Global Edge Cases to Track

- Season rollover at year boundaries, especially winter to previous fall and fall to next winter.
- Device clock and timezone differences affecting season calculations and token expiry.
- Empty, missing, corrupted, or legacy `localStorage` entries.
- Stale `sessionStorage` values from old routes after navigation.
- MyAnimeList token expiry, refresh-token expiry, missing cookies, and partial cookie writes.
- OAuth callback state mismatch and double callback submission.
- Jikan, AniList, and MAL rate limiting or malformed responses.
- Duplicate anime IDs returned by upstream APIs.
- Anime with missing images, missing English title, missing trailer, missing studios, unknown episode count, or not-yet-aired status.
- Mobile safe-area inset changes, iOS standalone PWA mode, and landscape orientation.
- Worker failure, blocked worker script, or worker fetch returning 401 after token expiry.
- App Router default Server Component behavior accidentally executing browser-only code on the server.
- Next.js fetch caching differences causing stale or overly dynamic pages.
- Existing hard-coded production or localhost origins leaking into the wrong environment.
