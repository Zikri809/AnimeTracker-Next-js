# Task 09: Hardening, Cleanup, and Release

## Purpose

Finish the migration by proving App Router parity, confirming the Pages Router compatibility surface is gone, tightening TypeScript and CI, validating production behavior, and preparing a safe rollout with a clear rollback path.

This is a release task, not a feature task. Make only the changes needed to harden, verify, clean up, and ship the migrated app safely.

## Current Repo Facts To Recheck First

Run these commands before implementing. If the output differs from the notes below, update this task file before continuing.

```powershell
Get-ChildItem -Recurse -File src/pages | Select-Object -ExpandProperty FullName
Get-ChildItem -Recurse -File src/app | Where-Object { $_.Name -match '^(page|route|layout)\.(tsx|ts|js|jsx)$' } | Select-Object -ExpandProperty FullName
Test-Path src/pages/api
Test-Path jsconfig.json
npm pkg get scripts
```

Expected at last check:

- `src/pages` has no remaining files.
- `src/pages/api` is already gone.
- `jsconfig.json` does not exist, so do not add a fake cleanup task for it.
- `src/app/search/[title]/page.tsx` exists.
- `src/app/ExceedRetryLimit/page.tsx` exists.
- No `testbed` route exists under `src/pages` or `src/app`.
- `npm run verify` currently runs lint, typecheck, Vitest, and Playwright, but not `npm run build`. CI must still run `npm run build` explicitly or `verify` must be updated to include build.
- `.github/workflows/ci.yml` exists and runs lint, typecheck, Vitest, build, and Playwright on Node 20.
- `.nvmrc` does not exist, so CI should keep an explicit supported Node version unless an `.nvmrc` is added.
- `.github/workflows/isr-warmup.yml` uses `vars.PRODUCTION_BASE_URL` with a production fallback, ASCII log text, timeout, retry, and non-2xx failure handling. Before release, confirm whether the fallback URL is acceptable or remove it so the repo depends only on configured deployment variables.

## Non-Negotiable Requirements

- Do not reintroduce Pages Router files unless a rollback explicitly requires it.
- Do not leave duplicate public routes in `src/pages` and `src/app` after parity is proven.
- If a Pages Router file reappears during conflict resolution, do not remove it until the equivalent App Router behavior is implemented, tested, and manually smoke-checked.
- Keep debug/testbed routes out of production routing unless they are explicitly protected by a development-only guard.
- CI must block on install, lint, typecheck, unit tests, production build, and Playwright smoke tests.
- Release verification must run against both a local production build and a Vercel preview deployment.
- Live MAL testing must use a disposable/safe test account. Do not use or commit a personal password. Prefer manual OAuth login in the browser with credentials stored outside the repo.
- No server-only secret may appear in client bundles, logs, Playwright fixtures, screenshots, markdown reports, or CI output.
- Every intentional behavior difference from the Pages Router baseline must be documented in the final migration report.

## Cleanup Scope

### Pages Router Cleanup

1. Confirm `src/pages` remains empty.
   - Run `Get-ChildItem -Recurse -File src/pages` if the directory exists.
   - Do not leave duplicate public routes in `src/pages` and `src/app`.
   - If merge conflicts or rollbacks restore Pages Router files, repeat the parity checks below before deleting them again.

2. Verify `src/app/search/[title]/page.tsx` search-results parity.
   - Preserve `/search/NA` empty-search behavior.
   - Preserve search terms with spaces, Unicode, URL reserved characters, and encoded slashes according to the existing route policy.
   - Preserve infinite scroll, session cache, scroll restore, and local watchlist badges.
   - Add Playwright coverage for `/search/NA`, a normal term such as `/search/naruto`, and a special-character term.

3. Verify `src/app/ExceedRetryLimit/page.tsx` retry-limit parity.
   - Use App Router `searchParams`; do not reintroduce `next/router`.
   - Preserve `original_link` and `original_query` behavior.
   - Handle missing, invalid, or malicious query values without crashing or open-redirecting.
   - Add Playwright coverage for a retry-limit redirect from a mocked failing detail route and direct access with missing params.

4. Confirm the old testbed route stays removed.
   - No `src/pages/testbed/index.tsx` or `src/app/testbed/page.tsx` should ship.
   - If a testbed is still useful, keep it outside public production routing or behind an explicit development-only guard.
   - Confirm any replacement does not import production-only secrets or trigger live MAL calls accidentally.

5. Verify the App Router shell fully replaced `_app.js` and `_document.js`.
   - Verify App Router `layout.tsx` covers global CSS, font, viewport, manifest, Apple startup images, Google verification, Analytics, Speed Insights, `SeasonProvider`, `QueryClientProvider`, `Persistent_worker`, and mobile navbar.
   - Run `rg -n "from ['\"]next/router['\"]|next/router|src/pages" src tests migration_plan` and document any remaining references.

### API Cleanup

1. Confirm `src/pages/api` is absent.
2. Confirm every public API endpoint from Task 05 responds from `src/app/api/**/route.ts`:
   - `/api/seasonal`
   - `/api/anime/anime_details`
   - `/api/anime/search`
   - `/api/cron/isr_warmUp/warmUp`
   - `/api/users/auth/authorize`
   - `/api/users/auth/callback`
   - `/api/users/auth/log_out`
   - `/api/users/auth/refresh_accesstoken`
   - `/api/users/auth/session`
   - `/api/users/data/user_data`
   - `/api/users/data/userlist`
   - `/api/users/data/save_anime`
   - `/api/users/data/delete_anime`
3. Confirm `public/worker/worker.js` still calls only live App Router API URLs.
4. Confirm auth/data routes use `credentials: "same-origin"` in browser/worker callers and avoid cache where session state is involved.

### Dependency And Config Cleanup

Run:

```powershell
rg -n "from ['\"](swiper|embla-carousel-react|styled-components|serve|nookies)['\"]|require\(['\"](swiper|embla-carousel-react|styled-components|serve|nookies)['\"]\)" src tests
npm ls --depth=0
```

Cleanup rules:

- Remove unused dependencies only when `rg` and tests prove they are unused.
- Keep `embla-carousel-react` while `src/components/ui/carousel.tsx` depends on it.
- Remove stale package scripts, batch files, or workflow references only if they are not documented developer entry points.
- Do not remove `public/worker/worker.js`, manifest icons, PWA assets, or splash images unless tests and manual PWA checks prove they are unused.

## TypeScript Hardening

### Phase 1: No New Untyped Surface

- No new `.js` or `.jsx` files may be added.
- Any JS/JSX file touched during this task should be converted to TS/TSX unless it is deleted.
- Add explicit prop interfaces for converted components.
- Replace `any` with domain types where the shape already exists in `src/types`, `src/server/**`, or tracking helpers.

### Phase 2: Convert High-Value Remaining Files

Prioritize files that affect release safety:

- `src/Utility/validation.js`
- `src/Utility/sync_user_data/dataValidity.js`
- `src/Utility/refreshjob.js`
- `src/Utility/randomstring.js`
- `src/Utility/sleep.js`
- `src/Utility/overflow_detect.js`
- remaining `src/components/ui/*.jsx`
- remaining `src/ComponentsSelf/**/*.jsx` used by App Router routes
- `src/reactbits/background/**/*.jsx` if imported by App Router pages

For each conversion:

- Keep behavior identical.
- Add or update tests when parsing, storage, auth, timers, or route navigation are involved.
- Run `rg -n "\.jsx|\.js" src/app src/server src/lib src/Utility src/ComponentsSelf src/components` and document remaining intentional legacy files.

### Phase 3: Compiler Strictness

Do not flip all strict flags blindly. Tighten in this order:

1. Keep `strictNullChecks: true`.
2. Fix reachable errors, then enable `noImplicitAny`.
3. Fix index access issues, then consider `noUncheckedIndexedAccess`.
4. After remaining JS/JSX is either converted or intentionally documented, set `allowJs: false`.
5. Only after `allowJs: false` passes, remove JS/JSX globs from `tsconfig.json` include.

Stop and document if a stricter flag requires broad unrelated rewrites.

## CI Hardening

Confirm or update the main CI workflow under `.github/workflows/ci.yml`.

Required gate order:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
      - run: npm run test:e2e
        env:
          PLAYWRIGHT_TEST: "true"
          Client_ID: ${{ secrets.MAL_CLIENT_ID_FOR_TESTS }}
          Client_Secret: ${{ secrets.MAL_CLIENT_SECRET_FOR_TESTS }}
          dev_auth_redirect: http://localhost:3000/api/users/auth/callback
          prod_auth_redirect: https://example.invalid/api/users/auth/callback
```

If `.nvmrc` does not exist, either add one matching the supported Node version for the current Next.js version, or pin `node-version` explicitly in the workflow.

CI requirements:

- Playwright must install browser dependencies.
- Tests must use mocked upstreams by default, not live Jikan, AniList, or MAL availability.
- CI env values must be non-production test values.
- `npm run build` must run even if `verify` is left unchanged.
- If `verify` is updated, prefer:

```json
"verify": "npm run lint && npm run typecheck && npm run test && npm run build && npm run test:e2e"
```

- Do not put real secrets in workflow YAML.

### Warm-Up Workflow Cleanup

Confirm `.github/workflows/isr-warmup.yml` before release:

- Replace hard-coded production URL with an environment variable or GitHub variable such as `vars.PRODUCTION_BASE_URL`.
- Keep the cron path `/api/cron/isr_warmUp/warmUp`.
- Use ASCII log text.
- Fail on non-2xx responses.
- Add a short timeout and retry.
- Avoid running warm-up against preview deployments unless deliberately configured.
- If a production fallback URL remains in the workflow, confirm it is an intentional emergency fallback and keep it updated with the current production domain.

## Verification Matrix

### Local Commands

Run these from repo root:

```powershell
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
npm run verify
```

If `npm run verify` does not include `build`, keep the separate `npm run build` result in the release notes.

### Static Checks

```powershell
rg -n "from ['\"]next/router['\"]|next/router" src/app src/server src/lib
rg -n "src/pages|pages/api" src tests public migration_plan
rg -n "process\.env\.(Client_Secret|access_token|refresh_token|MAL_CLIENT_SECRET)" src/app src/ComponentsSelf src/Utility src/components
rg -n "Client_Secret|access_token|refresh_token|code_verifier|oauth_state" src tests public migration_plan
rg -n "anime-tracker-next-js\.vercel\.app|localhost:3000|http://localhost" src public .github migration_plan
rg -n "localStorage|sessionStorage|window\.|document\." src/server src/app/**/page.tsx
rg -n "cache: ['\"]no-store['\"]|force-no-store|force-dynamic" src/app src/server
```

Expected:

- No `next/router` in App Router or server modules.
- No route-conflicting Pages Router files remain after final cleanup.
- No secrets in client-side code, tests, public assets, or docs.
- Hard-coded URLs are either intentional, documented, or moved to config/env.
- Browser APIs are isolated to client components/helpers.
- Dynamic/no-store caching appears only where intended, such as auth/user routes.

### Playwright Coverage Required

Playwright must cover:

- `/`
- `/search/NA`
- `/search/naruto`
- `/Anime/1`
- `/Anime/1/tracking`
- `/Anime/1/relation/5`
- `/Anime/1/relation/5/tracking`
- `/morethiseseason`
- `/morelastseason`
- `/moreupcoming`
- `/seasons/spring/2026`
- `/mylist`
- `/mylist/login`
- `/mylist/login_success`
- `/mylist/logout_success`
- `/mylist/user_profile`
- `/ExceedRetryLimit`
- `/api/cron/isr_warmUp/warmUp`

For each browser journey, assert:

- no uncaught console error;
- no hydration mismatch;
- no `window is not defined`;
- no `localStorage is not defined`;
- no `next/router` App Router error;
- no unhandled promise rejection;
- fixed mobile nav does not cover primary content on mobile viewport.

### Unit Coverage Required

Vitest coverage must include:

- route context parsing and invalid param rejection;
- search term sanitization/encoding;
- retry-limit URL construction and search param parsing;
- safe localStorage/sessionStorage parsing;
- watchlist save/delete mutations across all five categories;
- worker payload validation and partial failure handling;
- OAuth state mismatch, missing code, missing verifier, refresh 401, and refresh malformed JSON;
- MAL save/delete validation for ID, status, score, and episode;
- Jikan/MAL/AniList 429, 500, malformed JSON, duplicate IDs, and missing optional fields;
- PWA metadata generation or layout metadata checks where practical;
- `getBaseUrl()` behavior for production `Prod_host`, `VERCEL_URL`, request origin, and local fallback.

## Vercel Preview Validation

Before production release, deploy a Vercel preview and run:

```powershell
$env:PLAYWRIGHT_BASE_URL="https://<preview-url>"
npx playwright test
```

If the current Playwright config does not support overriding `baseURL`, add a small config change so preview smoke tests can target `PLAYWRIGHT_BASE_URL`.

Preview checklist:

- Required env vars exist in the Vercel preview environment:
  - `Client_ID`
  - `Client_Secret`
  - `dev_auth_redirect`
  - `prod_auth_redirect`
  - `Prod_host`
  - `NEXT_PUBLIC_Local_host` only if intentionally needed client-side
- OAuth redirect URIs configured in MAL match deployed callback URLs.
- Vercel cron path is `/api/cron/isr_warmUp/warmUp`.
- `vercel.json` schedule is intentional and does not conflict with GitHub warm-up schedule.
- `next.config.mjs` `images.remotePatterns` cover actual poster/banner domains seen in mocked and live smoke tests.
- Manifest and icons load with 200 responses.
- Apple startup image metadata does not create broken links.
- Analytics and Speed Insights load exactly once.
- App works when opened directly on deep links, not only through client navigation.

## Live MAL Smoke Test

Only run live MAL after mocked unit and Playwright tests pass.

Use a disposable MAL test account with non-sensitive data. Do not send or store a personal password in this repo, chat, screenshots, CI, or docs. If credentials must be shared for local manual testing, use a temporary password and rotate it immediately after the test.

Manual live test steps:

1. Open the Vercel preview.
2. Go to `/mylist/login`.
3. Complete OAuth manually in the browser.
4. Confirm callback lands on `/mylist/login_success`, then redirects to `/mylist`.
5. Confirm all five MAL categories import without overwriting good local data on partial failure.
6. Save an anime from `/Anime/1/tracking` to `Watching`.
7. Confirm MAL receives the update.
8. Delete the anime from tracking.
9. Confirm MAL and localStorage both remove it.
10. Log out.
11. Confirm local watchlists and session state clear.

Record only pass/fail notes and timestamps. Do not record credentials, tokens, cookies, or OAuth codes.

## Visual And PWA Validation

Compare against baseline screenshots:

- `migration_plan/baseline/screenshots/desktop/home.png`
- `migration_plan/baseline/screenshots/desktop/search-na.png`
- `migration_plan/baseline/screenshots/desktop/anime-1.png`
- `migration_plan/baseline/screenshots/desktop/anime-1-tracking.png`
- `migration_plan/baseline/screenshots/desktop/mylist.png`
- `migration_plan/baseline/screenshots/desktop/morethiseseason.png`
- `migration_plan/baseline/screenshots/desktop/morelastseason.png`
- `migration_plan/baseline/screenshots/desktop/moreupcoming.png`
- `migration_plan/baseline/screenshots/desktop/seasons-spring-2026.png`
- matching mobile screenshots under `migration_plan/baseline/screenshots/mobile`

Acceptable differences:

- documented fixes for broken legacy behavior;
- App Router metadata output differences that do not change the user experience;
- intentional removal of debug/testbed routes.

PWA checklist:

- Manifest loads and contains expected name, icons, start URL, and display mode.
- Install prompt is not blocked by missing icons.
- Installed/mobile standalone mode can open `/`, `/mylist`, and a detail route.
- Service worker or browser cache does not serve stale JS after a new deploy.
- Logout/login after an app update does not repopulate old storage from stale worker messages.

## Security And Privacy Checks

- Confirm access and refresh tokens are httpOnly where intended.
- Confirm client-readable session data excludes access token, refresh token, code verifier, OAuth state, and client secret.
- Confirm logs do not print tokens, cookies, OAuth codes, MAL responses containing private user data, or full request headers.
- Confirm auth callback rejects state mismatch and malicious redirect origins.
- Confirm user-provided query/path values are encoded before being used in links.
- Confirm `/ExceedRetryLimit` cannot be used as an open redirect.
- Confirm CI artifacts and Playwright traces do not contain live MAL secrets.

## Rollback Plan

Document the exact rollback before production deploy.

Minimum rollback procedure:

1. Identify the last known-good production deployment in Vercel.
2. Promote or redeploy that deployment if release smoke fails.
3. Revert the release commit or open a hotfix PR depending on severity.
4. If auth/cookie behavior changed, instruct testers to clear app cookies and retry after rollback.
5. If PWA/service worker cache serves stale assets, bump the asset/cache version or instruct users to reload/clear site data.
6. If MAL writes caused bad test data, clean it up from the disposable MAL account and confirm no real user account was used.

Rollback verification:

- `/` loads.
- `/mylist` loads with existing local storage.
- OAuth login/logout works or is disabled intentionally while hotfixing.
- `/api/cron/isr_warmUp/warmUp` returns 2xx.
- No new client console errors appear on the rolled-back deployment.

## Implementation Order

1. Re-run the current repo facts and update this plan if the inventory changed.
2. Verify App Router parity for `search/[title]` and `ExceedRetryLimit`.
3. Confirm testbed remains absent from public production routing.
4. Add focused tests for any remaining parity gaps.
5. Confirm no Pages Router files or route conflicts remain.
6. Verify `layout.tsx` fully replaced `_app.js` and `_document.js` responsibilities.
7. Clean up stale imports, dependencies, and configs.
8. Tighten TypeScript in the phased order above.
9. Confirm CI and warm-up workflows.
10. Run full local verification.
11. Deploy preview and run preview smoke.
12. Run optional live MAL smoke with a disposable account.
13. Complete final migration report and rollback notes.
14. Release to production.
15. Monitor production logs, cron, auth, MAL sync, and client errors.

## Deliverables

- Verified App Router parity for migrated public routes and documented removal of debug-only routes.
- No route-conflicting Pages Router files remain.
- CI workflow with lint, typecheck, unit tests, build, and Playwright.
- Warm-up workflow cleaned up and configurable.
- TypeScript hardening report with remaining JS/JSX intentionally documented.
- Final migration report listing intentional behavior differences.
- Production smoke checklist with local, preview, and optional live MAL results.
- Rollback notes with exact deployment target and verification steps.

## Definition Of Done

- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run test:e2e`, and `npm run verify` pass locally.
- CI passes on the release branch.
- Vercel preview deploys successfully.
- Preview Playwright smoke passes.
- Vercel cron invokes `/api/cron/isr_warmUp/warmUp` successfully.
- Baseline screenshot comparison has no unintended UI regressions.
- No server-only env variables or auth tokens appear in client bundles, logs, traces, or reports.
- No App Router code imports `next/router`.
- No public Pages Router routes remain unless explicitly documented as intentionally retained.
- Rollback plan is documented and has been reviewed before production deploy.
- Optional live MAL smoke is either passed with a disposable account or explicitly deferred with a reason.

## Edge Cases To Watch

- `src/app/search/page.tsx` redirects to `/search/NA`, but `/search/[title]` is missing after conflict resolution or rollback.
- `/ExceedRetryLimit` breaks because App Router `searchParams` are handled differently from `next/router.query`.
- App Router `layout.tsx` misses a provider, CSS import, metadata field, analytics hook, or PWA asset previously supplied by `_app.js` or `_document.js`.
- A restored or replacement `testbed` route ships publicly and triggers debug sync code.
- `npm run verify` passes while `npm run build` fails because build is not included.
- GitHub warm-up calls the wrong production URL after a domain change.
- Vercel preview env differs from production env, especially OAuth redirect URIs.
- Hard-coded `localhost` or production URLs leak into preview or CI tests.
- Cached browser storage from the old app version crashes new parsing code.
- Stale worker messages repopulate watchlists after logout.
- App Router fetch cache persists stale seasonal data or auth-sensitive data.
- Service worker/PWA cache serves old assets after deployment.
- Analytics or Speed Insights load twice because both old and new shells are active.
- Production-only image domains fail because `remotePatterns` are incomplete.
- MAL returns 401, 403, 429, 500, malformed JSON, or partial category failures during sync.
- User navigates away during OAuth callback, worker sync, save, delete, restore, or logout timers.
- Browser privacy mode blocks storage and causes `getItem` or `setItem` to throw.
- Playwright traces or screenshots accidentally capture OAuth tokens during live testing.
