# Task 02: Framework, Tooling, and TypeScript Foundation

## Purpose

Upgrade the project foundation to support the latest Next.js App Router and TypeScript without changing user-facing routes yet.

## Requirements

- Upgrade framework dependencies intentionally and commit lockfile changes.
- Fix linting before introducing migration churn.
- Add TypeScript in permissive mode so JS and JSX can coexist with TS and TSX.
- Keep current Pages Router routes operational.

## Specific Tasks

- Upgrade:
  - `next`
  - `react`
  - `react-dom`
  - `eslint-config-next`
- Add:
  - `typescript`
  - `@types/node`
  - `@types/react`
  - `@types/react-dom`
  - Vitest and Playwright packages listed in `testing_strategy.md`.
- Replace `next lint` with `eslint .`.
- Rewrite `eslint.config.mjs` as valid ESLint flat config.
- Remove `eslint.ignoreDuringBuilds` from `next.config.mjs`.
- Create `tsconfig.json` and migrate the alias from `jsconfig.json`.
- Add `next-env.d.ts`.
- Add scripts:
  - `typecheck`
  - `test`
  - `test:watch`
  - `test:e2e`
  - `verify`
- Add initial `vitest.config.ts`.
- Add initial `playwright.config.ts`.

## Deliverables

- Updated `package.json`.
- Updated `package-lock.json`.
- Valid `eslint.config.mjs`.
- Updated `next.config.mjs`.
- New `tsconfig.json`.
- New `next-env.d.ts`.
- New `vitest.config.ts`.
- New `playwright.config.ts`.
- Minimal test setup files if needed.

## Definition of Done

- `npm ci` succeeds from a clean checkout.
- `npm run lint` runs ESLint rather than `next lint`.
- `npm run typecheck` succeeds or reports only explicitly documented pre-existing JS issues under permissive settings.
- `npm run build` reaches at least the same status as baseline.
- Existing Pages Router routes still run.

## Testing

- Add one trivial Vitest smoke test so CI proves the test runner works.
- Add one Playwright smoke test that starts the app and verifies `/` responds.
- Do not add broad assertions yet; this phase validates tooling.

## Edge Cases to Watch

- Next 16 removing config options that existed in Next 15.
- React 19 peer dependency warnings from UI libraries.
- ESLint flat config importing CommonJS plugins incorrectly.
- `jsconfig.json` and `tsconfig.json` both defining aliases.
- Turbopack behavior differing from production build behavior.
- Package-lock drift from previous installed state.
