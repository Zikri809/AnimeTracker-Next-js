# Task 08: My List, Worker Sync, and Auth UX

## Purpose

Migrate `/mylist` and related auth/status pages after lower-risk routes are stable. This area has the most client-side state and the highest regression risk.

## Requirements

- Keep `/mylist` primarily client-owned unless storage architecture changes.
- Preserve local-only mode for users who are not logged in.
- Preserve MAL sync for logged-in users.
- Preserve worker-based sync unless it is intentionally replaced.
- Preserve backup and restore behavior.

## Specific Tasks

- Migrate pages:
  - `/mylist`
  - `/mylist/login`
  - `/mylist/login_success`
  - `/mylist/login_failed`
  - `/mylist/logout_success`
  - `/mylist/user_profile`
- Ensure `public/worker/worker.js` still loads under App Router.
- Keep worker API calls compatible.
- Replace `next/router` usage in MyList components.
- Replace `router.events` scroll handling with App Router-compatible effects.
- Harden localStorage parsing before rendering list tabs.
- Preserve swipe gestures.
- Preserve tab state via `sessionStorage.activetab`.
- Preserve sort and slice persistence.
- Ensure token refresh logic still runs once per relevant lifecycle.
- Verify user profile fetch and statistics rendering.
- Replace `swiper` and `embla-carousel-react` with built-in/shadcn alternatives (e.g., shadcn/ui `Carousel` which relies on embla under the hood, or native CSS scroll snap points).

## Deliverables

- App Router MyList and auth UX pages.
- Hardened storage helpers.
- Worker sync compatibility tests.
- Auth UX Playwright tests.
- Removed corresponding Pages Router files after parity.

## Definition of Done

- `/mylist` works with empty storage, populated storage, corrupted storage, and logged-in cookies.
- Worker sync updates all five watchlist categories.
- Login success triggers sync and redirects as before.
- Logout clears cookies and local UI state as before.
- Backup export and restore import work.
- Mobile swipe tab switching works.
- Sort state survives navigation exactly as baseline.

## Testing

- Vitest:
  - storage parser with every watchlist key.
  - backup JSON validation.
  - restore merge/replace behavior.
  - mylist sort helpers.
  - token expiry helper.
- Playwright:
  - seed empty storage and visit `/mylist`.
  - seed populated storage and verify all tabs.
  - corrupt one storage key and verify fallback UI.
  - mock worker-backed endpoint responses.
  - simulate expired token and refresh.
  - login success sync populates localStorage.
  - backup download is created.
  - restore upload updates rendered list.
  - mobile swipe changes tabs.

## Edge Cases to Watch

- `localStorage.getItem(...)` returns null for one category.
- Stored value is valid JSON but wrong shape.
- Worker starts twice and races writes.
- Worker receives 401 during the third status fetch.
- User navigates away while worker is running.
- `expires_in` cookie is malformed.
- Refresh succeeds but returns no refresh token.
- Sort state from one tab leaks into another tab.
- Infinite scroll slice count persists after logout or reset.
- Backup file contains an older schema.
