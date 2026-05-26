# Baseline Environment Variable Inventory

This file intentionally records variable names and usage only. Do not commit secret values.

## Variables Present in Local `.env`

- `Client_ID`
- `Client_Secret`
- `NEXT_PUBLIC_Local_host`
- `Prod_host`
- `dev_auth_redirect`
- `prod_auth_redirect`

## Server-Only Variables

These must never be exposed to Client Components:

- `Client_Secret`
- `Prod_host`

These are currently used by server-side fetches or API routes:

- `Client_ID`
- `Client_Secret`
- `Prod_host`
- `dev_auth_redirect`
- `prod_auth_redirect`

## Public Variable

- `NEXT_PUBLIC_Local_host`

Because this variable is public, it can appear in browser bundles. During migration, avoid using it to choose production origins. It can accidentally force production code to self-fetch localhost if configured incorrectly.

## Migration Risks

- App Router Server Components can read server env values, but Client Components cannot safely use secrets.
- OAuth route handlers must keep `Client_Secret` server-side.
- Server Components should avoid self-fetching through `NEXT_PUBLIC_Local_host`; prefer shared server functions or route-local data access.
- Preview, production, and local Vercel environments need separate validation before release.
