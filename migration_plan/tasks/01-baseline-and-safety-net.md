# Task 01: Baseline and Safety Net

## Purpose

Capture current behavior before migration work begins. This phase gives later changes a concrete comparison point so the team can prove the App Router version behaves the same.

## Requirements

- Do not change routing architecture in this phase.
- Run a clean install before judging build output.
- Document any current failures instead of silently fixing them.
- Capture desktop and mobile behavior for all core flows.

## Specific Tasks

- Run `npm ci`.
- Record `node --version`, `npm --version`, `npm list next react react-dom eslint-config-next`.
- Run and record current results for:
  - `npm run build`
  - `npm run lint`
  - `npm run dev`
- Start the app and capture screenshots for:
  - `/`
  - `/search/NA`
  - `/Anime/1`
  - `/Anime/1/tracking`
  - `/mylist`
  - `/morethiseseason`
  - `/morelastseason`
  - `/moreupcoming`
  - `/seasons/spring/2026`
- Document current console errors and network failures separately from migration-introduced failures.
- Export representative `localStorage` watchlist fixtures for all five statuses.
- Document required environment variables and which ones are server-only.

## Deliverables

- `migration_plan/baseline/current-state.md`
- `migration_plan/baseline/routes.md`
- `migration_plan/baseline/env.md`
- `migration_plan/baseline/screenshots/desktop/*`
- `migration_plan/baseline/screenshots/mobile/*`
- `migration_plan/baseline/local-storage-fixtures/*.json`

## Definition of Done

- Baseline commands and results are recorded.
- Key pages have desktop and mobile screenshots.
- Known pre-existing issues are listed and separated from migration scope.
- Core route inventory is complete.
- LocalStorage fixture data can be reused by Playwright tests.

## Testing

- No new automated tests are required in this phase.
- Confirm manually that the baseline screenshots and notes are enough to compare against later phases.

## Edge Cases to Capture

- First visit with empty storage.
- Visit with populated storage.
- Visit with corrupted storage values.
- Logged-out MyList behavior.
- Logged-in cookie-present behavior if a safe non-production account is available.
- Slow Jikan/MAL/AniList responses.
- Mobile viewport with bottom nav and safe-area inset.
