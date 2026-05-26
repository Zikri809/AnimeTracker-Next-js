# Baseline Current State

Captured on 2026-05-26 in `C:\AnimeTracker-Next-js`.

## Environment

- Node: `v22.14.0`
- npm: `10.9.2`
- Next.js after clean install: `15.3.8`
- React after clean install: `19.1.0`
- React DOM after clean install: `19.1.0`
- ESLint config package: `eslint-config-next@15.3.1`

## Baseline Commands

### `npm ci`

Status: passed.

Notes:

- Installed 513 packages.
- `npm audit` reported 18 vulnerabilities: 6 low, 5 moderate, 6 high, 1 critical.
- No dependency fixes were applied during baseline capture.

### `npm list next react react-dom eslint-config-next`

Status: passed.

Important resolved versions:

- `next@15.3.8`
- `react@19.1.0`
- `react-dom@19.1.0`
- `eslint-config-next@15.3.1`

### `npm run lint`

Status: failed.

Output:

```text
> animetracker-next-js@0.1.0 lint
> next lint

module is not defined in ES module scope
```

Baseline interpretation:

- Linting is currently nonfunctional.
- This is caused before lint findings are reported.
- The project has `eslint.config.mjs`, but it uses CommonJS-style `module.exports` and references `compat` without creating it.

### `npm run build`

Status: passed after allowing the MAL CDN image host.

Important output:

- Next compiled successfully.
- 52 static pages generated.
- Linting is skipped during build because `next.config.mjs` sets `eslint.ignoreDuringBuilds: true`.
- Routes are still served from Pages Router.

Warnings:

```text
Warning: data for page "/seasons/[season]/[year]" exceeded 128 kB.
Warning: data for page "/morelastseason" exceeded 128 kB.
```

Earlier build pass also emitted an Edge Runtime warning around a Node.js `url` module import trace from Next server utils. Track this during route-handler migration.

## Small Baseline Fix Applied

The first browser pass found that pages using MAL CDN images could fail with:

```text
Invalid src prop (https://cdn.myanimelist.net/...) on `next/image`, hostname "cdn.myanimelist.net" is not configured
```

To make the baseline screenshots usable, `cdn.myanimelist.net` was added to `images.remotePatterns` in `next.config.mjs`.

Verification:

- Direct optimizer check returned HTTP `200` for `/_next/image?url=https://cdn.myanimelist.net/...`.
- All previously failed or suspicious routes returned HTTP `200` after the change.

## Dev Server

Command:

```text
npm run dev
```

Status: running successfully at:

- `http://localhost:3000`
- `http://172.26.112.1:3000`

Server notes:

- Turbopack reports `TP1001 new Worker("/worker/worker.js") is not statically analyse-able` from `src/ComponentsSelf/persistent_worker/persistent_worker.jsx`.
- This warning is currently part of the baseline and should be preserved or intentionally fixed in a later migration task.
- Running `next build` while the dev server is active can invalidate `.next` artifacts used by the dev server. During capture, this briefly caused `/` to return `500` with a missing `build-manifest.json`; a clean dev-server restart restored `/` to HTTP `200`.

## HTTP Route Check

All target baseline routes returned HTTP `200` after the MAL CDN host fix:

| Route | Status |
| --- | --- |
| `/` | 200 |
| `/search/NA` | 200 |
| `/Anime/1` | 200 |
| `/Anime/1/tracking` | 200 |
| `/mylist` | 200 |
| `/morethiseseason` | 200 |
| `/morelastseason` | 200 |
| `/moreupcoming` | 200 |
| `/seasons/spring/2026` | 200 |

## Screenshots

Desktop screenshots:

- `migration_plan/baseline/screenshots/desktop/home.png`
- `migration_plan/baseline/screenshots/desktop/search-na.png`
- `migration_plan/baseline/screenshots/desktop/anime-1.png`
- `migration_plan/baseline/screenshots/desktop/anime-1-tracking.png`
- `migration_plan/baseline/screenshots/desktop/mylist.png`
- `migration_plan/baseline/screenshots/desktop/morethiseseason.png`
- `migration_plan/baseline/screenshots/desktop/morelastseason.png`
- `migration_plan/baseline/screenshots/desktop/moreupcoming.png`
- `migration_plan/baseline/screenshots/desktop/seasons-spring-2026.png`

Mobile screenshots at `390x844`:

- `migration_plan/baseline/screenshots/mobile/home.png`
- `migration_plan/baseline/screenshots/mobile/search-na.png`
- `migration_plan/baseline/screenshots/mobile/anime-1.png`
- `migration_plan/baseline/screenshots/mobile/anime-1-tracking.png`
- `migration_plan/baseline/screenshots/mobile/mylist.png`
- `migration_plan/baseline/screenshots/mobile/morethiseseason.png`
- `migration_plan/baseline/screenshots/mobile/morelastseason.png`
- `migration_plan/baseline/screenshots/mobile/moreupcoming.png`
- `migration_plan/baseline/screenshots/mobile/seasons-spring-2026.png`

Result metadata files:

- `migration_plan/baseline/screenshots/desktop/results-part1.json`
- `migration_plan/baseline/screenshots/desktop/results-part2.json`
- `migration_plan/baseline/screenshots/mobile/results-part1.json`
- `migration_plan/baseline/screenshots/mobile/results-part2.json`

## Known Baseline Runtime Warnings

- React invalid DOM properties: `class`, `stroke-width`, `stroke-linecap`, `stroke-linejoin`.
- Missing unique React keys in multiple render paths.
- Turbopack worker static-analysis warning for `new Worker("/worker/worker.js")`.
- `next/head` and Pages Router app shell are still active.
- Search page `/search/NA` renders the search empty state, which is useful as a baseline but should be verified against a populated search fixture later.

## Baseline Scope Notes

- No App Router migration was performed.
- No TypeScript setup was performed.
- No lint or test tooling was fixed.
- No storage redesign was performed.
- The only functional code change was adding the missing MAL CDN image hostname so the baseline route captures could render.
