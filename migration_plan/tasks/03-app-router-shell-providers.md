# Task 03: App Router Shell and Providers

## Purpose

Introduce `src/app` with an App Router root layout and provider shell while preserving the current Pages Router shell from `src/pages/_app.js` and `src/pages/_document.js`.

This phase is a compatibility foundation. It should make future App Router routes safe to add, but it must not migrate public page routes yet.

## Current Baseline

- The app is still served entirely from `src/pages`; there is no `src/app` directory yet.
- `src/pages/_document.js` owns `<Html lang="en">` and `<body className="antialiased">`.
- `src/pages/_app.js` currently owns:
  - `src/styles/globals.css`.
  - `Poppins` from `next/font/google`.
  - `next/head` viewport, manifest, Apple startup image links, and Google site verification.
  - `Persistent_worker`.
  - `Season_context`.
  - `QueryClientProvider`.
  - Vercel Analytics and Speed Insights.
  - `Mobile_navbar`.
- `src/pages/_app.js` currently creates `new QueryClient()` on every render. This must be fixed while touching the shell.
- `Season_context` is exported from `src/pages/_app.js` and imported by:
  - `src/ComponentsSelf/LastSeason.jsx`
  - `src/ComponentsSelf/Upcoming.jsx`
  - `src/ComponentsSelf/ThisSeasonSec.jsx`
  - `src/pages/index.js`
  - `src/pages/morethiseseason/index.js`
  - `src/pages/morelastseason/index.js`
  - `src/pages/moreupcoming/index.js`
  - `src/pages/seasons/[season]/[year]/index.js`
- `src/ComponentsSelf/navbar/mobile_navbar.jsx` imports `useRouter` from `next/router`. It cannot be imported directly into an App Router client component in that state.
- `src/ComponentsSelf/persistent_worker/persistent_worker.jsx` uses cookies, `Worker`, `localStorage`, and `useEffect`; it must remain client-only.
- `src/Utility/seasonaldata.js` duplicates most of the season calculation currently embedded in `_app.js`.

## Non-goals

- Do not create `src/app/page.tsx` in this phase. Creating it would duplicate `/` with `src/pages/index.js`.
- Do not move public pages from `src/pages` to `src/app` in this phase.
- Do not move API routes in this phase.
- Do not remove `src/pages/_app.js` or `src/pages/_document.js` yet.
- Do not redesign the layout, navigation, PWA assets, storage model, auth flow, or worker sync behavior.

## Required Design Decisions

### Router Coexistence

Pages Router routes do not automatically use `src/app/layout.tsx`. Until individual routes move to `src/app`, Pages Router routes must keep their existing `_app.js` provider shell.

The implementation must therefore either:

1. Share provider modules between `_app.js` and `src/app/providers.tsx`, or
2. Keep equivalent provider composition in both places and document why the duplication is temporary.

Prefer shared modules where it reduces risk, but do not import from `src/pages/_app.js` outside `src/pages`.

### App Routes

Do not add a public App Router route just to exercise the layout. If runtime verification of the App Router shell is needed during development, use a temporary non-conflicting route locally and remove it before the task is complete.

### Client Boundary

`src/app/layout.tsx` is a Server Component by default. It may import CSS, `next/font/google`, metadata types, and the client `Providers` component. It must not call browser APIs, React client hooks, `new QueryClient()`, `parseCookies`, `Worker`, `window`, `document`, `localStorage`, or `sessionStorage`.

`src/app/providers.tsx` must start with `"use client"` and is the correct home for React Context, React Query, persistent worker startup, mobile nav, analytics, and speed insights.

## Implementation Plan

### 1. Create a neutral season context module

Create `src/context/season-context.tsx`.

Responsibilities:

- Export a typed `SeasonContextValue` matching the current keys:
  - `current_month`
  - `current_year`
  - `current_season`
  - `past_season`
  - `past_year`
  - `upcoming_season`
  - `upcoming_year`
- Export the context as `Season_context` to minimize call-site churn.
- Also export a more idiomatic alias, for example `SeasonContext`, only if useful.
- Export `getSeasonContextValue(now?: Date): SeasonContextValue`.
- Export `SeasonProvider`.
- Keep season names lowercase: `winter`, `spring`, `summer`, `fall`.
- Preserve the existing month mapping:
  - January to March: `winter`
  - April to June: `spring`
  - July to September: `summer`
  - October to December: `fall`
- Preserve year boundary behavior:
  - Winter's past season is previous year's fall.
  - Fall's upcoming season is next year's winter.

Client/server guidance:

- If only client components need this module, put `"use client"` at the top of `src/context/season-context.tsx`.
- If server code also needs season calculation later, split the pure date logic into `src/lib/season.ts` and keep `src/context/season-context.tsx` as a client-only wrapper around it.
- Do not import a file that calls `createContext`, `useMemo`, or other React client hooks into an App Router Server Component.

Implementation guidance:

```tsx
"use client";

import { createContext, useMemo } from "react";
import type { ReactNode } from "react";

export type AnimeSeason = "winter" | "spring" | "summer" | "fall";

export type SeasonContextValue = {
  current_month: number;
  current_year: number;
  current_season: AnimeSeason;
  past_season: AnimeSeason;
  past_year: number;
  upcoming_season: AnimeSeason;
  upcoming_year: number;
};

export const Season_context = createContext<SeasonContextValue | undefined>(undefined);

export function getSeasonContextValue(now = new Date()): SeasonContextValue {
  // Implement as pure date logic. Do not read browser APIs here.
}

export function SeasonProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => getSeasonContextValue(), []);
  return <Season_context.Provider value={value}>{children}</Season_context.Provider>;
}
```

Notes:

- The helper must be pure and testable with injected dates.
- If a consumer can render without a provider, add and use a `useSeasonContext()` hook that throws a clear error. Do not silently return incomplete default data.
- Keep `src/Utility/seasonaldata.js` unchanged in this phase unless the change is tiny and clearly safe. It is used by data fetching code and can be consolidated later.

### 2. Replace imports from `@/pages/_app`

Update every `Season_context` import to use the neutral context module:

```diff
- import { Season_context } from "@/pages/_app";
+ import { Season_context } from "@/context/season-context";
```

Files to update:

- `src/ComponentsSelf/LastSeason.jsx`
- `src/ComponentsSelf/Upcoming.jsx`
- `src/ComponentsSelf/ThisSeasonSec.jsx`
- `src/pages/index.js`
- `src/pages/morethiseseason/index.js`
- `src/pages/morelastseason/index.js`
- `src/pages/moreupcoming/index.js`
- `src/pages/seasons/[season]/[year]/index.js`

Acceptance check:

```powershell
rg -n "@/pages/_app|Season_context" src
```

Expected result:

- No imports from `@/pages/_app`.
- `Season_context` only appears in the neutral context module and legitimate consumers.

### 3. Fix Pages Router provider stability

Update `src/pages/_app.js` to import `SeasonProvider` from `@/context/season-context` and stop exporting `Season_context`.

Fix React Query client lifetime:

```jsx
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Persistent_worker>
      <SeasonProvider>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
          <Analytics />
          <SpeedInsights />
        </QueryClientProvider>
      </SeasonProvider>
      <Mobile_navbar />
    </Persistent_worker>
  );
}
```

Preserve the existing Pages Router `<Head>` tags in `_app.js` for now. They are still needed for routes that remain under `src/pages`.

### 4. Make the mobile navbar App Router-compatible

Refactor `src/ComponentsSelf/navbar/mobile_navbar.jsx` before importing it from `src/app/providers.tsx`.

Current risk:

- It imports `useRouter` from `next/router`.
- It mutates DOM styles through refs.
- It reads `sessionStorage` from a click handler, which is fine, but must remain guarded from server execution.

Preferred compatibility approach:

- Convert active-state styling to derived class names instead of mutating refs.
- Use `usePathname` from `next/navigation` for the current path, or use `next/compat/router` plus `usePathname` if the same component must remain compatible in both routers.
- Keep `resetState()` as an event handler and guard it:

```jsx
function resetState() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("sort_type");
  sessionStorage.removeItem("sorted_anime");
}
```

Acceptance checks:

- Mobile nav still highlights Home for `/`, `/Anime/**`, `/morelastseason/**`, `/morethiseseason/**`, `/moreupcoming/**`, and `/seasons/**`.
- Mobile nav still highlights Search for `/search/**`.
- Mobile nav still highlights MyList for `/mylist/**`.
- Clicking any mobile nav item still clears only `sort_type` and `sorted_anime`.
- The component can be imported by both `_app.js` and `src/app/providers.tsx` without a `next/router` App Router error.

### 5. Harden the persistent worker client boundary

Update `src/ComponentsSelf/persistent_worker/persistent_worker.jsx` only as much as needed for App Router compatibility.

Required behavior:

- Add `"use client"` at the top if this component will be imported by App Router providers.
- Keep all browser-only work inside `useEffect`.
- Do not call `parseCookies({})`, create dates from cookies, instantiate `Worker`, or touch `localStorage` during render.
- Use an empty dependency array unless a specific dependency is intentionally needed.
- Prevent duplicate worker startup in React Strict Mode and during router-shell coexistence.

Implementation notes:

- A `useRef` guard prevents duplicate startup during normal re-renders.
- React Strict Mode in development can mount, unmount, and remount; a module-level guard or worker reference may be needed if duplicate startup causes real side effects.
- Keep the existing behavior of not terminating the worker on route navigation unless Task 08 changes the worker lifecycle intentionally.

Acceptance checks:

- No `Worker is not defined` or `localStorage is not defined` errors during `next build`.
- No duplicate worker `postMessage("start")` when navigating between routes in the same shell.
- Missing, invalid, or expired `expires_in` cookie exits without starting the worker.

### 6. Create the App Router providers component

Create `src/app/providers.tsx`.

Required shape:

```tsx
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Persistent_worker from "@/ComponentsSelf/persistent_worker/persistent_worker";
import Mobile_navbar from "@/ComponentsSelf/navbar/mobile_navbar";
import { SeasonProvider } from "@/context/season-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Persistent_worker>
      <SeasonProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <Analytics />
          <SpeedInsights />
        </QueryClientProvider>
      </SeasonProvider>
      <Mobile_navbar />
    </Persistent_worker>
  );
}
```

Provider ordering must preserve the current behavior:

1. `Persistent_worker` remains outside the page content and mobile nav.
2. `SeasonProvider` wraps route content that reads season context.
3. `QueryClientProvider` wraps route content that uses React Query hooks.
4. Vercel Analytics and Speed Insights are mounted once per router shell.
5. `Mobile_navbar` remains outside page content so pages do not need to render it individually.

### 7. Create the App Router root layout

Create `src/app/layout.tsx`.

Responsibilities:

- Import `src/styles/globals.css`.
- Configure Poppins with the same subset, display, and weights.
- Export `metadata`.
- Export `viewport`.
- Render `<html lang="en">`.
- Render `<body className="... antialiased">`.
- Wrap children with `Providers`.
- Add a stable App Router root wrapper that can receive the old `#__next` layout styles.

Recommended structure:

```tsx
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "@/styles/globals.css";
import { APPLE_STARTUP_IMAGES } from "./apple-startup-images";
import Providers from "./providers";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins-family",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
  verification: {
    google: "JaWtTN1_CBU0wc-SqB4fy9DTi0C4E1Sl_hGEEZnAfsE",
  },
  appleWebApp: {
    startupImage: APPLE_STARTUP_IMAGES,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className={`${poppins.className} antialiased`}>
        <Providers>
          <div data-app-router-root>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
```

Notes:

- Use `export const viewport`, not `metadata.viewport`.
- Use `metadata.manifest` for the manifest link.
- Use `metadata.verification.google` for the Google verification meta tag.
- Use `metadata.appleWebApp.startupImage` for Apple startup images. The Next metadata type supports `{ url, media }`.
- Use leading slashes for startup image URLs, for example `/splash_screens/...png`, so nested App Router URLs do not resolve them relatively.
- Do not import `next/head` in `src/app/layout.tsx`.
- Do not move `src/pages/_document.js` behavior out from under Pages Router yet.

### 8. Extract Apple startup image metadata

Do not leave the full startup image list inline in `layout.tsx`; it makes the layout hard to review.

Create either:

- `src/app/apple-startup-images.ts`, or
- `src/lib/pwa/apple-startup-images.ts`.

Export an array compatible with `Metadata["appleWebApp"]["startupImage"]`.

Suggested export shape:

```ts
import type { Metadata } from "next";

type AppleWebAppMetadata = Exclude<
  NonNullable<Metadata["appleWebApp"]>,
  boolean
>;

export const APPLE_STARTUP_IMAGES = [
  {
    media: "screen and (...)",
    url: "/splash_screens/example.png",
  },
] satisfies NonNullable<AppleWebAppMetadata["startupImage"]>;
```

Requirements:

- Preserve every startup image currently listed in `_app.js`.
- Preserve each `media` string exactly unless correcting a clear typo.
- Prefix each image URL with `/`.
- Add a quick count in the test or code comment so future edits can catch accidental drops.

Acceptance check:

- Playwright or a DOM smoke test confirms the rendered head contains the same number of `link[rel="apple-touch-startup-image"]` entries for App Router routes once the first App Router page exists.
- During this phase, compare the extracted list against `_app.js` manually or with a script before committing.

### 9. Preserve font behavior

Current code passes `poppins.className` to `Persistent_worker`, but `Persistent_worker` does not forward `className` to a DOM element. Do not preserve that ineffective placement.

Required outcome:

- App Router pages get Poppins from the `<body>` class or a root wrapper.
- Existing `font-poppins` utility usage keeps working if the app expects it.

Implementation options:

- Apply `poppins.className` directly to `<body>` in `src/app/layout.tsx`.
- If Tailwind `font-poppins` is expected to work under Tailwind v4, expose the Next font variable through `@theme inline` without creating a self-referential CSS variable. For example, configure Next font with `variable: "--font-poppins-family"` and map `--font-poppins: var(--font-poppins-family);` in `globals.css`.

Acceptance checks:

- `font-poppins` text renders with the expected font family.
- Pages Router screenshots do not visually drift after `_app.js` cleanup.
- App Router screenshots match Pages Router shell styling once a route is migrated.

### 10. Add App Router root CSS parity

Update `src/styles/globals.css` only as needed to preserve root layout assumptions.

Current Pages Router root:

```css
#__next {
  min-height: 100vh;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: hidden;
}
```

Add an App Router equivalent:

```css
#__next,
[data-app-router-root] {
  min-height: 100vh;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: hidden;
}
```

Also verify whether `html`, `body`, and the root wrapper need `min-height: 100%` or `width: 100%` to avoid mobile bottom nav overlap or horizontal scroll.

Do not make broad CSS cleanup in this task.

## Deliverables

- `src/app/layout.tsx`
- `src/app/providers.tsx`
- `src/context/season-context.tsx`
- Apple startup image metadata extracted to `src/app/apple-startup-images.ts` or `src/lib/pwa/apple-startup-images.ts`
- Updated `Season_context` imports replacing `@/pages/_app`
- Updated `src/pages/_app.js` that uses the neutral season provider and a stable QueryClient
- App Router-compatible `Mobile_navbar`
- Client-safe `Persistent_worker`
- CSS adjustment for `[data-app-router-root]` if needed
- Tests described below

## Definition of Done

- `next build` succeeds with both `src/app` shell files and existing Pages Router routes.
- Existing Pages Router routes still receive their provider shell from `_app.js`.
- No public route path exists in both `src/pages` and `src/app`.
- No production code imports from `@/pages/_app`.
- No browser-only code runs in `src/app/layout.tsx` or during server build.
- React Query client is stable across provider re-renders.
- `Persistent_worker` does not start twice for a single mounted shell.
- Vercel Analytics and Speed Insights are not duplicated on a single route.
- Poppins and existing `font-poppins` usage render consistently.
- Mobile bottom nav behavior still matches baseline.
- Manifest, viewport, Google verification, and Apple startup metadata are present in the correct router shell.

## Testing

### Static checks

Run:

```powershell
npm run lint
npm run typecheck
npm run build
rg -n "@/pages/_app" src
```

Expected:

- Lint, typecheck, and build pass.
- `rg -n "@/pages/_app" src` returns no matches.

### Vitest

Add tests for `src/context/season-context.tsx`:

- January date returns current `winter`, past `fall` with previous year, upcoming `spring` with current year.
- March date still returns `winter`.
- April date returns `spring`.
- June date still returns `spring`.
- July date returns `summer`.
- September date still returns `summer`.
- October date returns `fall`, upcoming `winter` with next year.
- December date still returns `fall`, upcoming `winter` with next year.
- Invalid dates either throw a clear error or are handled explicitly. Pick one behavior and test it.

Add provider smoke tests:

- `SeasonProvider` renders children.
- `Providers` renders children in jsdom.
- React Query client is not recreated on rerender.
- Worker startup is mocked and does not run during render.
- Mobile nav can render with a mocked pathname.

### Playwright

Run existing smoke coverage against Pages Router routes:

- `/` still renders.
- Mobile bottom nav is visible on mobile viewport.
- Mobile bottom nav does not overlap the last meaningful page content.
- Manifest link exists on Pages Router routes.
- Apple startup metadata exists on Pages Router routes.
- Google site verification meta exists on Pages Router routes.
- No hydration errors, `next/router` App Router errors, `Worker is not defined`, or `localStorage is not defined` errors appear in the console.

Once the first App Router route is added in a later task, repeat the same metadata and mobile shell assertions for that route.

## Edge Cases to Watch

- A Client Component provider imported from `layout.tsx` accidentally loses `"use client"`.
- `Mobile_navbar` keeps importing `next/router` and crashes on App Router routes.
- QueryClient is recreated every render, clearing cache and refetching unexpectedly.
- Season context is computed with different dates across SSR and hydration near midnight or season boundaries.
- Winter and fall year rollover breaks because the old helper had duplicated mutable variables.
- App Router root does not receive the old `#__next` flex and overflow behavior.
- Apple startup image URLs resolve relative to nested routes because they are missing a leading `/`.
- Metadata is added with `next/head` in App Router instead of `metadata` and `viewport` exports.
- Analytics or Speed Insights are mounted in both a route component and provider shell.
- `Persistent_worker` starts twice in React Strict Mode or after hot reload.
- Worker code reads expired or malformed cookies and still starts.
- `sessionStorage` access in mobile nav runs during render instead of in a click handler.
- `font-poppins` silently stops working because the Next font variable is applied to the wrong element or not mapped into Tailwind v4 theme variables.
- Pages Router metadata is removed too early, causing existing `src/pages` routes to lose PWA tags before migration.

## Senior Engineer Rationale & Design Decisions

To ensure a robust, future-proof architectural foundation for App Router coexistence, the following decisions were made:

### 1. TypeScript Migration & Centralization of Custom Types
- **Why we converted JSX to TSX**: Standardizing the core shell and layout components to `.tsx` prevents type drift and enforces contract safety between the Page and App routers. It ensures future routes can reuse these layouts with total parameter verification.
- **Barrel Exports**: All types are structured under `src/types/` and exported via `src/types/index.ts`. This serves as the single source of truth for the codebase, preventing duplicate definitions.
- **Carousel Component Migration**: Shifting `src/components/ui/carousel.jsx` to `.tsx` was necessary because React/TypeScript's implicit type inference for untyped destructured parameter signatures was incorrectly classifying optional embla configuration parameters as mandatory.

### 2. Timezone-Resilient Date Calculations
- **Timezone Isolation**: By isolating calculations to a pure date function `getSeasonContextValue(now?: Date)`, calculations are decoupled from the system date. This is key for testing timezone boundaries and preventing SSR / hydration mismatches that occur when server/client dates differ near season cutoffs.
- **Consolidation**: De-duplicated dates and year rollover routines out of `_app.js` into the centralized context wrapper, reducing future maintenance overhead.

### 3. Stability of Providers and Shared State
- **QueryClient Reference Stability**: Using `const [queryClient] = useState(() => new QueryClient())` guarantees the instance is constructed exactly once during initial mounting. Instantiating it at render-time (as in the Pages Router previously) would reset query caches and re-fetch data on every parent component update.
- **Worker & Storage Boundary Isolation**: Because the App Router builds and pre-renders layouts on the server, all references to cookie parsers, browser `window`, `Worker`, and `localStorage` must reside strictly inside client-side `useEffect` hooks to prevent build-time crashes.

### 4. Router-Agnostic Components
- **Replacing `next/router`**: Refactoring the navigation component `mobile_navbar.tsx` to use `usePathname` from `next/navigation` enables the component to query paths from both routers without crashing or needing conditional router setups.
- **State-Driven Styles vs Ref Mutation**: Rather than mutating direct element colors through refs (`.style.color = ...`), active states are derived dynamically using React state and standard styling conventions. This adheres to React declarative patterns.
- **Font Parity**: Configured Poppins using `variable: "--font-poppins-family"` and mapped it in `globals.css` inside the `@theme inline` block of Tailwind CSS v4. This preserves styling compatibility across all views.
