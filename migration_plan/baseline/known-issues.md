# Known Baseline Issues

These issues were observed before App Router migration work. Treat them as baseline facts unless a later task explicitly fixes them.

## Blocking or High Priority

- `npm run lint` fails immediately with `module is not defined in ES module scope`.
- `eslint.config.mjs` is malformed for ESM and references `compat` without creating it.
- Build skips lint through `eslint.ignoreDuringBuilds: true`.

## Runtime Warnings

- Turbopack warning: `new Worker("/worker/worker.js") is not statically analyse-able`.
- Running production build while the Turbopack dev server is active can cause temporary `.next` artifact errors in dev mode. Restart the dev server before browser verification after a build.
- React warnings for invalid DOM property names:
  - `class`
  - `stroke-width`
  - `stroke-linecap`
  - `stroke-linejoin`
- React warnings for missing unique `key` props in multiple list render paths.

## Performance Warnings

- Static page data for `/seasons/[season]/[year]` can exceed 128 kB.
- Static page data for `/morelastseason` can exceed 128 kB.

## Behavior Notes

- `/mylist` renders an empty local-storage state by default: `No shows in record yet`.
- `/search/NA` renders the search empty/start state in the current browser pass.
- Several pages have empty document titles except the homepage, which renders `AniJikan`.
- The app relies heavily on `localStorage`, `sessionStorage`, cookies, and browser workers.

## Fixed During Baseline Capture

- Added `cdn.myanimelist.net` to `next.config.mjs` image remote patterns.
- This was needed so MAL CDN image pages could render and screenshots could be captured.
