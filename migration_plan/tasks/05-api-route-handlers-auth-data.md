# Task 05: API Route Handlers, Auth, and Data Proxies

## Purpose

Move `src/pages/api` to App Router route handlers while preserving current public API URLs used by the app and web worker.

## Requirements

- Preserve endpoint paths until all callers are migrated.
- Use public Next.js APIs only.
- Keep httpOnly token handling server-side.
- Keep worker-compatible fetch endpoints.
- Preserve current GET-based mutation endpoints initially if changing method semantics would break callers, then add safer POST/DELETE behavior behind tests.

## Specific Tasks

- Migrate route files:
  - `src/pages/api/seasonal.js` to `src/app/api/seasonal/route.ts`.
  - `src/pages/api/anime/anime_details.js` to `src/app/api/anime/anime_details/route.ts`.
  - `src/pages/api/cron/isr_warmUp/warmUp.js` to `src/app/api/cron/isr_warmUp/warmUp/route.ts`.
  - `src/pages/api/users/auth/authorize.js` to `src/app/api/users/auth/authorize/route.ts`.
  - `src/pages/api/users/auth/callback.js` to `src/app/api/users/auth/callback/route.ts`.
  - `src/pages/api/users/auth/log_out.js` to `src/app/api/users/auth/log_out/route.ts`.
  - `src/pages/api/users/auth/refresh_accesstoken.js` to `src/app/api/users/auth/refresh_accesstoken/route.ts`.
  - `src/pages/api/users/data/user_data.js` to `src/app/api/users/data/user_data/route.ts`.
  - `src/pages/api/users/data/userlist.js` to `src/app/api/users/data/userlist/route.ts`.
  - `src/pages/api/users/data/save_anime.js` to `src/app/api/users/data/save_anime/route.ts`.
  - `src/pages/api/users/data/delete_anime.js` to `src/app/api/users/data/delete_anime/route.ts`.
- Replace `nookies` server usage with `next/headers` (`cookies()`), `NextRequest`, and `NextResponse`.
- Replace `nookies` client usage with lightweight native alternatives (e.g., `document.cookie` or JS-cookie).
- Replace internal `next/dist/compiled/@edge-runtime/cookies` imports.
- Add typed validation helpers for query params and request bodies.
- Ensure OAuth state mismatch returns immediately.
- Ensure refresh token code does not rely on unsupported runtime APIs.
- Preserve Vercel cron path in `vercel.json`.
- Decide per route whether `runtime = "edge"` is still safe.

## Deliverables

- Route handlers under `src/app/api/**/route.ts`.
- Typed validation helpers, preferably under `src/server` or `src/lib`.
- Updated API callers only where needed.
- API behavior compatibility notes.
- Deprecated `src/pages/api` files removed after route handlers pass tests.

## Definition of Done

- All old API URLs return expected responses from App Router route handlers.
- Worker script can still call `/api/users/data/userlist` and `/api/users/data/user_data`.
- OAuth authorize, callback, refresh, and logout flows work.
- Cookie flags match baseline or are intentionally improved and documented.
- Vercel cron still targets a valid route.
- No route handler imports internal Next.js implementation modules.

## Testing

- Vitest:
  - request validation.
  - OAuth URL generation.
  - callback state mismatch.
  - cookie write behavior via helper abstraction.
  - MAL proxy status/score/episode validation.
- Playwright:
  - mocked login callback sets expected cookies and lands on login success.
  - logout clears cookies and lands on logout success.
  - worker-backed mylist sync calls route handlers successfully.
  - save and delete tracking endpoints handle authenticated and unauthenticated cases.

## Edge Cases to Watch

- OAuth callback called twice.
- Callback called with wrong state.
- Callback called without code.
- Missing `code_verifier` cookie.
- `Client_Secret` accidentally exposed to client bundle.
- Refresh token missing or expired.
- Access token expired while worker sync is running.
- MAL returns 401, 403, 404, 429, or malformed JSON.
- GET mutation requests accidentally cached.
- Edge runtime lacking APIs used by Node-only code.
- `NEXT_PUBLIC_Local_host` causing self-fetch to localhost in production.
