# Task 03: App Router Shell and Providers

## Purpose

Introduce `src/app` with a root layout and provider structure while preserving the current app shell from `_app.js` and `_document.js`.

## Requirements

- Preserve global UI and PWA behavior.
- Keep React Context and React Query inside Client Components.
- Keep existing Pages Router routes working during this phase.
- Do not duplicate public route paths in both `src/pages` and `src/app` except for temporary non-conflicting shell files.

## Specific Tasks

- Create `src/app/layout.tsx`.
- Create `src/app/providers.tsx` with `"use client"`.
- Move or recreate:
  - `globals.css` import.
  - `<html lang="en">`.
  - `body` antialiasing and font class behavior.
  - Poppins font setup.
  - viewport metadata.
  - manifest link.
  - Apple startup image links.
  - Google site verification metadata.
  - Vercel Analytics.
  - Vercel Speed Insights.
  - `Persistent_worker`.
  - `Mobile_navbar`.
  - `QueryClientProvider`.
  - `Season_context`.
- Move `Season_context` into a neutral module, for example `src/context/season-context.tsx`.
- Ensure QueryClient is not recreated on every render.
- Add App Router equivalent styles for any `#__next` layout assumptions.

## Deliverables

- `src/app/layout.tsx`
- `src/app/providers.tsx`
- `src/context/season-context.tsx`
- Updated imports replacing `@/pages/_app` where needed.
- CSS adjustment for App Router root layout behavior if needed.

## Definition of Done

- The app builds with both `src/app` shell and existing Pages Router routes.
- Pages Router routes still receive their old providers until route migration begins, or an intentional compatibility approach is documented.
- No browser-only code runs in `layout.tsx`.
- Poppins and existing `font-poppins` usage render consistently.
- Mobile bottom nav and persistent worker behavior still match baseline.

## Testing

- Vitest:
  - season context value generation for representative dates.
  - provider smoke render in jsdom.
- Playwright:
  - `/` still renders after shell introduction.
  - mobile bottom nav is visible and not overlapping content.
  - manifest and startup metadata are present.
  - no hydration errors in console.

## Edge Cases to Watch

- Context provider accidentally used in a Server Component.
- QueryClient recreated every render and losing cache.
- App Router layout not applying old `#__next` flex and overflow behavior.
- Duplicate analytics injection.
- PWA links missing because Metadata API does not cover every custom link.
- Font class applied to a wrapper instead of body and causing visual drift.
- Persistent worker running twice during coexistence.
