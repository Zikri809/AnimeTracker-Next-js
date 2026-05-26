# Task 09: Hardening, Cleanup, and Release

## Purpose

Finish the migration by removing compatibility leftovers, tightening TypeScript, validating production behavior, and preparing a safe rollout.

## Requirements

- Do not remove Pages Router files until App Router parity is proven.
- Keep route behavior documented for any intentional deviations.
- CI must block on lint, typecheck, unit tests, build, and Playwright smoke tests.
- Production release must include a rollback plan.

## Specific Tasks

- Remove migrated `src/pages` route files.
- Remove `src/pages/api` after all route handlers are live.
- Remove `jsconfig.json` after `tsconfig.json` owns aliases.
- Tighten TypeScript:
  - gradually disable `allowJs` only after files are converted.
  - consider enabling stricter options after parity.
- Convert high-value files from JS/JSX to TS/TSX:
  - route handlers.
  - server fetch helpers.
  - storage helpers.
  - tracking helpers.
  - shared UI component props.
- Add CI workflow running `npm run verify`.
- Validate Vercel deployment:
  - cron route.
  - environment variables.
  - image remote patterns.
  - PWA assets.
  - analytics and speed insights.
- Run final visual comparison against baseline.
- Document rollback steps.

## Deliverables

- Clean `src/app` based routing.
- No unused Pages Router route files.
- CI workflow with full verification.
- Final migration report.
- Rollback notes.
- Production smoke test checklist.

## Definition of Done

- `npm run verify` passes locally and in CI.
- Production build deploys successfully.
- Vercel cron invokes the migrated route.
- Playwright smoke suite passes against preview deployment.
- Baseline screenshot comparison has no unintended UI regressions.
- No server-only env variables appear in client bundles.
- Rollback plan is documented and tested at least conceptually.

## Testing

- Vitest:
  - all utility, validation, storage, and route-helper tests pass.
- Playwright:
  - full core suite from `testing_strategy.md`.
  - run against local production build and Vercel preview.
- Manual:
  - installed PWA smoke on mobile if possible.
  - MAL OAuth with a safe test account.
  - save/delete watchlist with live MAL only after mocked tests pass.

## Edge Cases to Watch

- Pages and App Router duplicate path conflicts before cleanup.
- Removing `_app.js` before every old Pages route is gone.
- `pages/api` removed while worker still calls a missing route.
- Vercel preview env differs from production env.
- Hard-coded production URLs in GitHub Actions or warmup code.
- Cached browser storage from old app version causing crashes.
- App Router fetch cache persisting stale seasonal data.
- Service worker or PWA cache serving old assets after deploy.
- Analytics loaded twice or not at all.
- Production-only image domain failures.
