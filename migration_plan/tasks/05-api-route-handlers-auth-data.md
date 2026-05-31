# Task 05: API Route Handlers, Auth, and Data Proxies

## Purpose

Move every `src/pages/api` endpoint to App Router route handlers while preserving the public `/api/**` URLs used by pages, components, and `public/worker/worker.js`.

This task is security-sensitive because it owns MAL OAuth, httpOnly tokens, cookie lifecycle, and server-side data proxying. Do the migration as a behavior-preserving route move first, with tightly scoped improvements where the current implementation is unsafe or broken.

## Current API Inventory

| Public URL | Current file | New file | Initial methods | Runtime decision |
| --- | --- | --- | --- | --- |
| `/api/seasonal` | `src/pages/api/seasonal.js` | `src/app/api/seasonal/route.ts` | `GET` | `edge` is safe if helper code stays Web API only |
| `/api/anime/anime_details` | `src/pages/api/anime/anime_details.js` | `src/app/api/anime/anime_details/route.ts` | `GET` | `edge` is safe if cookie parsing uses `NextRequest.cookies` |
| `/api/cron/isr_warmUp/warmUp` | `src/pages/api/cron/isr_warmUp/warmUp.js` | `src/app/api/cron/isr_warmUp/warmUp/route.ts` | `GET` | `nodejs` because this is a retrying cron job and does not need Edge |
| `/api/users/auth/authorize` | `src/pages/api/users/auth/authorize.js` | `src/app/api/users/auth/authorize/route.ts` | `GET` | `nodejs` |
| `/api/users/auth/callback` | `src/pages/api/users/auth/callback.js` | `src/app/api/users/auth/callback/route.ts` | `GET` | `nodejs` |
| `/api/users/auth/log_out` | `src/pages/api/users/auth/log_out.js` | `src/app/api/users/auth/log_out/route.ts` | `GET` | `nodejs` |
| `/api/users/auth/refresh_accesstoken` | `src/pages/api/users/auth/refresh_accesstoken.js` | `src/app/api/users/auth/refresh_accesstoken/route.ts` | `GET`, optional `POST` alias | `nodejs` because current code uses Node `Buffer` for Basic auth |
| `/api/users/auth/session` | new endpoint | `src/app/api/users/auth/session/route.ts` | `GET` | `nodejs` |
| `/api/users/data/user_data` | `src/pages/api/users/data/user_data.js` | `src/app/api/users/data/user_data/route.ts` | `GET` | `edge` is safe if helper code stays Web API only |
| `/api/users/data/userlist` | `src/pages/api/users/data/userlist.js` | `src/app/api/users/data/userlist/route.ts` | `GET` | `edge` is safe if helper code stays Web API only |
| `/api/users/data/save_anime` | `src/pages/api/users/data/save_anime.js` | `src/app/api/users/data/save_anime/route.ts` | `GET` compatibility, add `POST` | `edge` is safe if helper code stays Web API only |
| `/api/users/data/delete_anime` | `src/pages/api/users/data/delete_anime.js` | `src/app/api/users/data/delete_anime/route.ts` | `GET` compatibility, add `DELETE` | `edge` is safe if helper code stays Web API only |

Keep `vercel.json` cron path exactly as `/api/cron/isr_warmUp/warmUp`.

## Non-Negotiable Constraints

- Preserve every public URL in the inventory until all callers are explicitly migrated.
- Use App Router route handlers with named HTTP exports, for example `export async function GET(request: NextRequest)`.
- Use public Next.js APIs only: `NextRequest`, `NextResponse`, `request.nextUrl`, `request.cookies`, and `await cookies()` from `next/headers` when a global cookie store is needed.
- Replace all `nookies` usage in this task.
- Replace server-side `nookies` usage with built-in Next.js APIs. Do not add a new server cookie library.
- Prefer replacing client-side `nookies` usage with a server-backed session/status endpoint that returns non-secret auth state. Use a tiny native `document.cookie` helper only as a compatibility bridge for readable legacy cookies.
- Do not import `next/headers` or `next/server` from client components, browser utilities, or `public/worker/worker.js`; those modules are server-only.
- Do not import `next/dist/**` or other internal Next.js implementation modules.
- Do not expose `Client_Secret`, access tokens, refresh tokens, `code_verifier`, or OAuth `state` to client bundles, responses, logs, or query strings.
- Keep `access_token` and `refresh_token` httpOnly and server-side only.
- Keep `expires_in` readable initially because current UI and worker refresh behavior use it; move those callers to `/api/users/auth/session` before making it httpOnly or removing it.
- Keep `user_data` readable initially because `/mylist/user_profile` currently reads the cookie; move that caller to `/api/users/auth/session` before making it httpOnly or removing it.
- Preserve GET-based `save_anime` and `delete_anime` during this task because existing callers use GET. Add safer `POST` and `DELETE` handlers in the same route files and cover both old and new methods with tests.
- Mark auth and data proxy handlers dynamic and uncached. Use route segment config plus upstream `fetch` options so GET mutation and auth responses are never cached.
- Remove sensitive `console.log` statements from auth routes. Logging token exchange bodies, state, verifier, or tokens is not allowed.

## Recommended Shared Files

Create small, testable helpers before moving routes. Keep framework-specific response wiring inside route files and keep pure validation/building logic easy to unit test.

| File | Responsibility |
| --- | --- |
| `src/server/env.ts` | Read and validate server-only env vars. Provide `getRequiredEnv(name)` and `getAuthRedirectUri()` helpers. |
| `src/server/http/cookies.ts` | Cookie names, shared cookie options, auth cookie setters, auth cookie clearers, and transient OAuth cookie clearers. |
| `src/server/http/responses.ts` | `jsonOk`, `jsonError`, no-store headers, `Vary: Cookie` for cookie-dependent responses, and safe upstream error response helpers. |
| `src/server/auth/session.ts` | Build a non-secret session snapshot from cookies for the session endpoint and future Server Components. |
| `src/server/mal/validation.ts` | Parse and validate query params and request bodies. |
| `src/server/mal/oauth.ts` | Build MAL authorize URL, exchange auth code, refresh access token, and normalize token responses. |
| `src/server/mal/client.ts` | Fetch MAL seasonal data, user data, user list, anime details, save status, and delete status. |

Do not create a large class or framework wrapper. The goal is boring helpers that make route handlers short and predictable.

## `nookies` Replacement Map

The goal is to remove `nookies` completely from this slice. Server code gets Next.js built-ins; browser code should prefer a server-backed session/status endpoint and use native cookie reads only as a temporary compatibility bridge.

Server-side replacements:

| Current `nookies` API | Replacement in App Router route handlers |
| --- | --- |
| `parseCookies({ req })` | `request.cookies.get('cookie_name')?.value` from `NextRequest` |
| `setCookie({ res }, name, value, options)` | `const response = NextResponse...; response.cookies.set(name, value, options); return response` |
| `destroyCookie({ res }, name, { path: '/' })` | `response.cookies.delete(name)` or `response.cookies.set(name, '', { path: '/', maxAge: 0 })` when explicit options are needed |

Client-side replacement:

- `next/headers`, `NextRequest`, and `NextResponse` cannot be used in client components or browser workers.
- Preferred path: replace client-side `parseCookies({})` calls with a fetch to `/api/users/auth/session`.
- Compatibility path: where replacing the caller would be too invasive in this task, use a tiny browser helper around `document.cookie`, for example `getClientCookie(name)` and `hasClientCookie(name)`.
- The browser helper may read only non-httpOnly legacy cookies such as `expires_in` and `user_data`.
- Do not attempt to read `access_token`, `refresh_token`, `state`, or `code_verifier` on the client; successful migration should make that impossible by design.
- After all replacements are complete, `rg -n "nookies" src tests` should return no matches unless a separate follow-up task explicitly defers a file.

## App Router Handler Rules

- In every new route file, export only supported method functions and route segment options.
- Set `export const runtime` explicitly for each route using the runtime decision in the inventory table.
- Use `NextResponse.json(body, { status, headers })` for JSON responses.
- Use `NextResponse.redirect(new URL('/path', request.url), status)` for internal redirects.
- When setting cookies on redirects, create the `NextResponse` first and then call `response.cookies.set(...)`.
- In Next 16, `cookies()` from `next/headers` is async; use `const cookieStore = await cookies()` if that API is needed.
- Prefer `request.cookies.get('name')?.value` inside route handlers because it is explicit and easy to test with `NextRequest`.
- Add these exports to auth, user data, and mutation routes unless there is a documented reason not to:

```ts
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
```

- Add `cache: 'no-store'` to upstream `fetch` calls for auth and user-specific data.
- Add `Vary: Cookie` to responses whose body depends on cookies, even when `Cache-Control: no-store` is also present. This prevents any later cache-policy regression from leaking one user's derived state to another.
- Return a safe JSON shape for errors. Never serialize raw `Error` objects or upstream bodies that could contain tokens.
- Use `URL` and `URLSearchParams` to build all upstream URLs and form bodies. Do not concatenate unvalidated query strings.

## Duplicate Route Handling

Do not leave a Pages API route and an App Router route handler active for the same public URL.

Safe sequence per endpoint:

1. Extract and test shared helper logic.
2. Add the new `src/app/api/**/route.ts`.
3. Remove the corresponding `src/pages/api/**` file in the same change before running `next build`.
4. Run the route tests and build.
5. Move to the next endpoint.

If a route needs rollback during implementation, restore the old Pages API file and remove the matching App Router route file for that endpoint.

## Cookie Contract

Use one source of truth for cookie names and options.

| Cookie | Written by | Read by | httpOnly | Max age | Notes |
| --- | --- | --- | --- | --- | --- |
| `state` | authorize | callback | yes | 1 hour | OAuth CSRF protection. Clear on callback success and callback failure. |
| `code_verifier` | authorize | callback | yes | 1 hour | PKCE verifier. Clear on callback success and callback failure. |
| `access_token` | callback, refresh | server routes only | yes | MAL `expires_in` | Clear on logout and failed refresh if token is unusable. |
| `refresh_token` | callback, refresh | refresh route only | yes | 60 days | Clear on logout and failed refresh if MAL says it is invalid. |
| `expires_in` | callback, refresh | session endpoint, legacy client callers | no initially | MAL `expires_in` | Store an ISO timestamp string. Treat it as a client hint only. Prefer moving client reads to `/api/users/auth/session`, then make this httpOnly or remove it in a later cleanup. |
| `user_data` | user_data route | session endpoint, legacy `/mylist/user_profile` caller | no initially | 60 days | Store encoded JSON only if it fits cookie size limits. Prefer moving client reads to `/api/users/auth/session`, then make this httpOnly or remove it in a later cleanup. |

Cookie options:

- `path: '/'`
- `secure: true`
- `sameSite: 'lax'`
- `httpOnly: true` for all secrets
- `httpOnly: false` only for `expires_in` and `user_data`

For local HTTP development, if `secure: true` prevents testing cookies, add a helper that uses `secure: process.env.NODE_ENV === 'production'`. Document that choice in the compatibility notes and test both option branches through the helper.

## Validation Contract

Centralize validation in `src/server/mal/validation.ts`.

Shared parsing rules:

- `anime_id`, `id`, `offset`, `episode`, and `score` must be parsed as base-10 integers using a strict digit check. `parseInt('1abc')` must not pass.
- Missing required params return `400`.
- Invalid params return `400`.
- Missing auth cookies return `401` and must not call MAL.
- Upstream auth failures return `401` or `403` where MAL returns those statuses.
- Upstream not found returns `404`.
- Upstream rate limit returns `429`.
- Upstream malformed JSON or network failure returns `502`.
- Unexpected local exceptions return `500`.

Allowed values:

- Seasons: `winter`, `spring`, `summer`, `fall`.
- User list status: `watching`, `completed`, `on_hold`, `dropped`, `plan_to_watch`.
- User list sort: `list_score`, `list_updated_at`, `anime_title`, `anime_start_date`.
- Save status: `watching`, `completed`, `on_hold`, `dropped`, `plan_to_watch`.
- Score: integer `0` through `10`.
- Episode count: integer `0` or greater.
- Offset: integer `0` or greater.
- Seasonal year: exactly four digits. Keep the current broad behavior unless a separate task adds year range limits.
- Seasonal limit: optional integer from `1` to `500`; default to `500`.

## Route Contracts

### `GET /api/seasonal`

Inputs:

- Required query params: `year`, `season`.
- Optional query params: `limit`, `offset`.

Behavior:

- Validate `year`, `season`, `limit`, and `offset` before calling MAL.
- Build `https://api.myanimelist.net/v2/anime/season/{year}/{season}` with `sort=anime_score`, `nsfw` omitted as today, default `limit=500`, default `offset=0`, and existing fields:
  `main_picture,status,start_season,num_episodes,title,alternative_titles,mean,num_scoring_users,popularity,genres`.
- Send `X-MAL-CLIENT-ID` from server env.
- Return upstream JSON on success.
- Return `400` for invalid query.
- Return safe upstream errors without exposing env values.

Tests:

- Valid request builds the exact MAL URL and client ID header.
- Missing `year` or `season` returns `400` without upstream fetch.
- Invalid year, season, limit, and offset return `400`.
- Missing `Client_ID` returns `500` with a safe message.
- Upstream `429` returns `429`.
- Malformed upstream JSON returns `502`.

### `GET /api/anime/anime_details`

Inputs:

- Required query param: `id`.
- Required cookie: `access_token`.

Behavior:

- Fix the baseline issue where the current file references `parseCookie` without importing it.
- Validate `id` as a positive integer.
- Return `401` if `access_token` is missing.
- Fetch `https://api.myanimelist.net/v2/anime/{id}` with `Authorization: Bearer <access_token>`.
- Return upstream JSON on success.

Tests:

- Missing or invalid `id` returns `400`.
- Missing access token returns `401` without upstream fetch.
- Valid request sends the bearer token and returns MAL JSON.
- MAL `401`, `403`, `404`, and `429` are mapped safely.

### `GET /api/users/auth/authorize`

Behavior:

- Generate OAuth `state` with cryptographically secure randomness. Do not keep using `Math.random()` for OAuth state.
- Generate a PKCE verifier compatible with MAL's `plain` challenge flow.
- Keep `code_challenge=<code_verifier>` and `code_challenge_method=plain` unless a separate tested change proves MAL supports another method.
- Set `state` and `code_verifier` httpOnly cookies with 1-hour max age.
- Redirect to `https://myanimelist.net/v1/oauth2/authorize` with:
  - `response_type=code`
  - `client_id`
  - `state`
  - `redirect_uri`
  - `code_challenge=<code_verifier>`
  - `code_challenge_method=plain`
- URL-encode all params through `URLSearchParams`.
- Do not include `Client_Secret`.

Tests:

- Response is a redirect to MAL authorize.
- Redirect URL includes expected params and URL encoding.
- `state` and `code_verifier` cookies are set with secure options.
- Missing `Client_ID` or redirect URI returns a safe `500`.
- No secret appears in redirect URL or response body.

### `GET /api/users/auth/callback`

Inputs:

- Required query params: `code`, `state`.
- Required cookies: `state`, `code_verifier`.

Behavior:

- Validate `code` and `state` before token exchange.
- If `state` cookie does not exactly match query `state`, return immediately. Do not call MAL after writing the error or redirect response.
- Clear `state` and `code_verifier` on success and on any callback failure.
- Exchange the authorization code at `https://myanimelist.net/v1/oauth2/token` with `application/x-www-form-urlencoded` body:
  - `client_id`
  - `client_secret`
  - `grant_type=authorization_code`
  - `code`
  - `redirect_uri`
  - `code_verifier`
- Validate token response shape before setting cookies.
- Set `access_token`, `refresh_token`, and `expires_in` cookies.
- Redirect `302` to `/mylist/login_success` on success.
- Redirect `302` to `/mylist/login_failed` on missing code, missing verifier, state mismatch, MAL error, malformed token response, or network failure.
- Do not log the token request body or token response.

Tests:

- State mismatch returns immediately and `fetch` is not called.
- Missing `code` redirects to login failed and clears transient cookies.
- Missing `code_verifier` redirects to login failed and does not call MAL.
- MAL non-2xx redirects to login failed and does not set auth cookies.
- Malformed token JSON redirects to login failed.
- Successful callback sets all auth cookies, clears transient cookies, and redirects to login success.
- Calling callback twice fails the second time because transient cookies were cleared.

### `GET /api/users/auth/refresh_accesstoken`

Optional compatibility improvement:

- Also export `POST` and have it call the same implementation. Existing callers use `GET`; new code can use `POST`.

Inputs:

- Required cookie: `refresh_token`.

Behavior:

- Return `401` if `refresh_token` is missing.
- Keep `runtime = 'nodejs'` if using `Buffer` for Basic auth.
- Send token refresh request to `https://myanimelist.net/v1/oauth2/token` with no-store fetch.
- Preserve the currently working Basic auth behavior unless a tested MAL-compatible replacement is added.
- Validate token response shape.
- Set replacement `access_token`, `refresh_token`, and `expires_in` cookies.
- Return JSON `{ "message": "token refresh retrieved successfully" }` on success.
- If MAL returns `401` or `403`, clear auth cookies and return `401`.
- For other upstream/network failures, return a safe error status and do not leak token details.

Tests:

- Missing refresh token returns `401` without upstream fetch.
- Valid refresh sends Basic auth and form body.
- Successful refresh updates all auth cookies.
- MAL `401` clears auth cookies and returns `401`.
- MAL `429` returns `429`.
- Malformed token JSON returns `502`.

### `GET /api/users/auth/session`

Purpose:

- Give client components and browser workers a safe replacement for client-side `nookies` reads.
- Return derived session state and readable profile metadata without exposing raw tokens.
- Implement the cookie-reading logic in `src/server/auth/session.ts`, then have this route handler call that helper. Client code should fetch the route; it must not import the server helper directly.

Behavior:

- Read cookies server-side with `NextRequest.cookies` or `await cookies()`.
- Never return `access_token`, `refresh_token`, `state`, or `code_verifier`.
- Return a no-store JSON response:

```json
{
  "authenticated": true,
  "accessTokenExpiresAt": "2026-05-28T12:34:56.000Z",
  "hasRefreshToken": true,
  "userData": null
}
```

- `authenticated` should be `true` only when an auth signal is present and not obviously expired. At minimum, require `access_token` and a future `expires_in` timestamp. If the plan later chooses refresh-token based auth state, document that explicitly.
- `hasRefreshToken` is a boolean only. It must not reveal the refresh token value.
- `userData` may include the decoded `user_data` payload if it exists and parses safely. If it is missing, oversized, malformed, or intentionally removed later, return `null`.
- If `expires_in` is missing or malformed, return `authenticated: false`, `accessTokenExpiresAt: null`, and do not throw.
- Use `Cache-Control: no-store`.

Tests:

- Returns unauthenticated state when cookies are absent.
- Returns authenticated state with future `expires_in` and auth cookies.
- Expired or malformed `expires_in` returns unauthenticated state.
- Malformed `user_data` returns `userData: null`.
- Response never includes token cookie values.
- Response has no-store headers.

### `GET /api/users/auth/log_out`

Behavior:

- Clear `access_token`, `refresh_token`, `expires_in`, `user_data`, `state`, and `code_verifier`.
- Redirect `302` to `/mylist/logout_success`.
- If an unexpected error occurs, redirect `302` to `/mylist/login_failed`.

Tests:

- Clears all listed cookies with `path: '/'`.
- Redirects to logout success.
- Idempotent when cookies are already absent.

### `GET /api/users/data/user_data`

Inputs:

- Required cookie: `access_token`.

Behavior:

- Return `401` if `access_token` is missing.
- Fetch `https://api.myanimelist.net/v2/users/@me?fields=anime_statistics,picture` with bearer auth.
- Return `{ "success": "User data successfully fetched", "user_data": <mal json> }`.
- Preserve the misspelled `succes` key only if existing client code depends on it. If changing to `success`, document it in compatibility notes and cover the new response shape in tests.
- Set readable `user_data` cookie with encoded JSON, unless encoded value would exceed safe cookie size. If too large, return the JSON response but omit the cookie and include a safe warning field.

Tests:

- Missing access token returns `401` without upstream fetch.
- Valid request sends bearer token and returns expected response shape.
- Sets readable `user_data` cookie with secure options.
- Oversized user data does not produce an invalid `Set-Cookie` header.
- MAL `401`, `403`, and `429` are mapped safely.

### `GET /api/users/data/userlist`

Inputs:

- Required query params: `sort`, `offset`, `status`.
- Required cookie: `access_token`.

Behavior:

- Validate `sort`, `offset`, and `status`.
- Return `401` if `access_token` is missing.
- Fetch `https://api.myanimelist.net/v2/users/@me/animelist` with:
  - `status`
  - `sort`
  - `offset`
  - `fields=list_status,main_picture,status,start_season,num_episodes,title,alternative_titles,mean,num_scoring_users,popularity,genres`
  - `nsfw=true`
  - `limit=1000`
- Return MAL JSON directly on success so `public/worker/worker.js` and tracking sync utilities remain compatible.

Tests:

- Missing or invalid `sort`, `offset`, or `status` returns `400`.
- Missing access token returns `401` without upstream fetch.
- Valid request builds exact MAL URL and bearer header.
- Worker-compatible response shape is preserved.
- MAL `401`, `403`, `429`, and malformed JSON are handled safely.

### `GET` and `POST /api/users/data/save_anime`

GET inputs:

- Required query params: `anime_id`, `status`, `episode`, `score`.

POST inputs:

- JSON body with `anime_id`, `status`, `episode`, and `score`.

Required cookie:

- `access_token`.

Behavior:

- Keep GET compatibility for current callers in `src/Utility/tracking/savehandler_tracking.ts`.
- Add POST for safer future callers.
- Validate all inputs before calling MAL.
- Return `401` if `access_token` is missing.
- For mutation requests, add `Cache-Control: no-store` to responses.
- Require same-origin protection for mutation routes: if `Origin` is present, it must match `request.nextUrl.origin`; if only `Referer` is present, it must start with the same origin. Return `403` when the check fails.
- For legacy GET mutation compatibility only, document and test the behavior when both `Origin` and `Referer` are absent. If those requests are allowed to avoid breaking existing same-origin callers, mark that as a temporary compatibility risk and keep the new POST path as the preferred safe API.
- Send `PUT https://api.myanimelist.net/v2/anime/{anime_id}/my_list_status` with form body:
  - `status`
  - `score`
  - `num_watched_episodes`
- Return `{ "message": "successfully updated" }` on success.

Tests:

- Existing GET query style still works.
- POST JSON style works.
- Invalid status, score, episode, or anime ID returns `400`.
- Missing access token returns `401` without upstream fetch.
- Same-origin check rejects cross-origin mutation when `Origin` is present.
- Missing `Origin` and `Referer` behavior is explicitly tested and documented.
- MAL validation error returns safe error JSON.
- GET response has no-store headers.

### `GET` and `DELETE /api/users/data/delete_anime`

GET inputs:

- Required query param: `anime_id`.

DELETE inputs:

- Prefer query param `anime_id` for simplicity. If JSON body support is added, test it separately.

Required cookie:

- `access_token`.

Behavior:

- Keep GET compatibility for current callers in `src/Utility/tracking/deleteshow_tracking.ts`.
- Add DELETE for safer future callers.
- Validate `anime_id` before calling MAL.
- Return `401` if `access_token` is missing.
- Apply the same same-origin mutation protection as `save_anime`.
- Send `DELETE https://api.myanimelist.net/v2/anime/{anime_id}/my_list_status`.
- Return `{ "message": "successfully deleted" }` on success.

Tests:

- Existing GET query style still works.
- DELETE query style works.
- Missing or invalid anime ID returns `400`.
- Missing access token returns `401` without upstream fetch.
- Same-origin check rejects cross-origin mutation when `Origin` is present.
- Missing `Origin` and `Referer` behavior is explicitly tested and documented.
- MAL `404`, `401`, `403`, and `429` are mapped safely.
- GET response has no-store headers.

### `GET /api/cron/isr_warmUp/warmUp`

Behavior:

- Preserve `vercel.json` cron path.
- Use `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`, and no-store fetches.
- Build the same static route list:
  - `morethiseseason`
  - `morelastseason`
  - `moreupcoming`
- Build the same dynamic season route list from `seasonaldata()` and `extended_season_data()`.
- Avoid `NEXT_PUBLIC_Local_host` as the production base URL. Determine base URL in this order:
  1. `Prod_host` when present in production.
  2. `VERCEL_URL` converted to `https://<host>` when present.
  3. `request.nextUrl.origin` as fallback.
  4. Local development host only outside production.
- Retry each route up to three attempts with the existing delay.
- Return `200` only when all routes warm successfully.
- Return `400` with a summary of failed routes when any route still fails.

Tests:

- Route list contains expected static and seasonal routes.
- Uses production-safe base URL selection.
- Retries failed routes up to three times.
- Stops early when all routes succeed.
- Returns failed route summary without leaking env values.

## Caller Updates Required In This Task

Keep URL paths the same, but update callers where the migration exposes broken assumptions.

Known API callers at planning time:

| Caller | Current dependency |
| --- | --- |
| `public/worker/worker.js` | `/api/users/data/userlist`, `/api/users/data/user_data` |
| `src/Utility/tracking/savehandler_tracking.ts` | GET `/api/users/data/save_anime` |
| `src/Utility/tracking/deleteshow_tracking.ts` | GET `/api/users/data/delete_anime` |
| `src/Utility/tracking/looping_list_updater.js` | `/api/users/data/userlist` |
| `src/Utility/refreshjob.js` | `/api/users/auth/refresh_accesstoken` |
| Client auth/profile state currently using `parseCookies({})` | Prefer `/api/users/auth/session` |
| `src/pages/mylist/login/index.tsx` | `/api/users/auth/authorize` navigation |
| `src/ComponentsSelf/mylistnavbar.tsx` | `/api/users/auth/log_out` navigation |
| `src/Utility/seasonal_carousel/carousel_season_fetch.js` | absolute self-fetch to `/api/seasonal` through `NEXT_PUBLIC_Local_host` |
| `src/Utility/sync_user_data/dataValidity.js` | absolute self-fetch to `/api/users/data/userlist` through `NEXT_PUBLIC_Local_host ?? Prod_host` |

- Replace client-side `nookies` reads with a session fetch helper, for example `src/lib/auth-session.ts`, that calls `/api/users/auth/session`.
- If a specific caller cannot be moved to the session endpoint inside this task, use a temporary `src/lib/client-cookies.ts` helper. It should safely decode cookie values and return `undefined` when a value is missing or malformed. Do not use it for httpOnly cookies.
- Current readable cookies used by the client are `expires_in` and `user_data`; the session endpoint should become the preferred source for both.
- Update `public/worker/worker.js` only if response semantics change. It must still call:
  - `/api/users/data/userlist?&sort=list_updated_at&offset=${offset}&status=${status}`
  - `/api/users/data/user_data`
- Replace absolute self-fetches that use `process.env.NEXT_PUBLIC_Local_host` with relative same-origin URLs where the code runs in the browser. Known current callers are `src/Utility/seasonal_carousel/carousel_season_fetch.js` and `src/Utility/sync_user_data/dataValidity.js`.
- Keep `router.push('/api/users/auth/authorize')` and `push('/api/users/auth/log_out')` working.

Use this audit command before finishing:

```powershell
rg -n "nookies|next/dist/compiled|NEXT_PUBLIC_Local_host|/api/users|/api/seasonal|/api/anime/anime_details" src public tests
```

Expected result:

- No `next/dist/compiled` imports.
- No server-side `nookies` usage.
- No client dependency on httpOnly cookies.
- Any remaining client-side readable cookie helper usage is temporary, intentional, and documented.

## Implementation Sequence

1. Add shared validation, env, cookie, response, and MAL client helpers with Vitest coverage.
2. Implement auth route handlers first because cookie behavior drives later tests.
3. Implement data proxy route handlers using the shared MAL helpers.
4. Implement seasonal and anime detail route handlers.
5. Implement cron route handler and confirm `vercel.json` still points to the same public URL.
6. Implement `/api/users/auth/session` and update callers for client cookie reads and relative self-fetches.
7. Run route-level tests against App Router handlers.
8. Confirm each old `src/pages/api/**` file has been removed after its matching App Router route is in place and tested.
9. Remove `nookies` from dependencies only after `rg -n "nookies" src tests` is clean or remaining usage is explicitly deferred to another task.
10. Update compatibility notes with any intentional status-code or response-key changes.

## Deliverables

- Route handlers under `src/app/api/**/route.ts`.
- Shared helpers under `src/server/**` and a client session fetch helper under `src/lib/**`.
- Unit tests for validation, cookie helpers, OAuth helpers, MAL client response handling, and route handlers.
- Playwright coverage for login callback, logout, worker sync, and save/delete authenticated behavior.
- Compatibility notes documenting:
  - preserved URLs and methods,
  - new POST/DELETE mutation methods,
  - any response shape fixes such as `succes` to `success`,
  - any status-code changes from the old all-`500` behavior,
  - cookie flag changes.
- Old `src/pages/api/**` files removed route-by-route after the matching App Router handler and route tests are in place.

## Definition of Done

- Every endpoint in the inventory responds from `src/app/api/**/route.ts`.
- `/api/users/auth/session` returns non-secret session state for client callers.
- Every existing public API URL still works.
- Worker script can still call `/api/users/data/userlist` and `/api/users/data/user_data`.
- OAuth authorize, callback, refresh, and logout flows work with secure cookies.
- OAuth callback state mismatch does not call MAL.
- Callback replay fails because transient cookies are cleared.
- Save and delete still support current GET callers and also support new safer methods.
- Cookie flags match the cookie contract or are intentionally documented.
- Vercel cron still targets `/api/cron/isr_warmUp/warmUp`.
- `rg -n "next/dist/compiled" src` returns no matches.
- `rg -n "Client_Secret|access_token|refresh_token|code_verifier" src` confirms secrets are server-only and never logged.
- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, and relevant Playwright specs pass.

## Vitest Coverage Checklist

Validation helpers:

- Seasonal year, season, limit, and offset.
- Anime ID parsing rejects missing, non-numeric, decimal, negative, zero where not allowed, and mixed strings like `123abc`.
- MAL status and sort allowlists.
- Score range `0` to `10`.
- Episode count `0` or greater.
- JSON body parser handles invalid JSON and wrong content type.

Cookie helpers:

- Auth cookies include `httpOnly`, `secure`, `sameSite: 'lax'`, `path: '/'`, and correct max ages.
- Readable legacy cookies omit `httpOnly` only for `expires_in` and `user_data`.
- Logout clears all auth, readable, and transient cookies.
- Transient OAuth cookies clear on callback success and failure.

OAuth helpers:

- Authorize URL generation includes all required params.
- Authorize URL excludes `Client_Secret`.
- State generation is cryptographically secure and has expected length.
- Callback state mismatch fails closed.
- Token response validation rejects missing `access_token`, `refresh_token`, or invalid `expires_in`.

Route handlers:

- Each route accepts only intended methods. Unsupported methods produce Next's `405`.
- Missing auth cookie returns `401` without upstream fetch.
- Query/body validation failures return `400` without upstream fetch.
- Upstream `401`, `403`, `404`, and `429` map safely.
- Upstream malformed JSON returns `502`.
- Network failure returns `502`.
- GET mutation routes include no-store headers.
- Cookie-dependent routes include both `Cache-Control: no-store` and `Vary: Cookie`.
- Session route returns derived auth state and never returns token values.

Cron:

- Base URL selection avoids localhost in production.
- Retry behavior and final summary are deterministic.

## Playwright Coverage Checklist

- Mocked `/api/users/auth/authorize` journey redirects to MAL with state cookie set.
- Mocked callback success sets auth cookies and lands on `/mylist/login_success`.
- Callback with wrong state lands on `/mylist/login_failed` and does not call token exchange.
- Logout clears cookies and lands on `/mylist/logout_success`.
- Worker-backed mylist sync calls `/api/users/data/userlist` and `/api/users/data/user_data` successfully.
- Client auth/profile UI reads session state from `/api/users/auth/session` instead of `nookies`.
- Expired readable `expires_in` cookie triggers refresh behavior through `/api/users/auth/refresh_accesstoken`.
- Save tracking endpoint handles authenticated success and unauthenticated `401`.
- Delete tracking endpoint handles authenticated success and unauthenticated `401`.
- MAL `429` during worker sync shows the expected failure/retry behavior without crashing the page.

## Edge Cases To Watch

- OAuth callback called twice.
- Callback called with wrong state.
- Callback called without `code`.
- Callback called without `state`.
- Missing `code_verifier` cookie.
- `Client_Secret` accidentally imported into client code or included in logs.
- Refresh token missing, expired, or revoked.
- Access token expires while worker sync is running.
- MAL returns `401`, `403`, `404`, `429`, an HTML error page, or malformed JSON.
- GET mutation requests cached by the browser, Next.js, Vercel, or an intermediary.
- Cross-origin GET mutation attempts.
- GET mutation requests with neither `Origin` nor `Referer`.
- Cookie-dependent session/data responses accidentally cached or reused across users.
- Edge runtime helper accidentally importing Node-only APIs.
- User data cookie exceeding browser cookie limits.
- `NEXT_PUBLIC_Local_host` causing self-fetch to localhost in production.
- Existing misspelled response keys (`succes`) being fixed without updating callers/tests.

## Implementation Completion Status

This section was audited against the repository on 2026-05-28 after implementation.

Completed:

- All API endpoints in the inventory now resolve from `src/app/api/**/route.ts`.
- The old `src/pages/api/**` files have been removed.
- Shared server helpers now exist under `src/server/**`.
- `/api/users/auth/session` exists and returns non-secret session state.
- `nookies` has been removed from `package.json` and `package-lock.json`.
- `rg -n "nookies|next/dist/compiled" src public tests package.json package-lock.json` returns no matches.
- Client-side readable-cookie checks now use `/api/users/auth/session` instead of reading `expires_in` or `user_data` directly.
- Browser/API self-fetches that previously used `NEXT_PUBLIC_Local_host` now use relative URLs where appropriate.
- Cookie-dependent JSON responses use no-store headers and `Vary: Cookie`.
- Legacy GET mutation routes remain for compatibility, and POST/DELETE alternatives are available.
- Unit tests cover helpers, auth route handlers, data route handlers, cron retry behavior, same-origin mutation checks, no-store headers, and session responses.

Implemented files:

- `src/server/env.ts`
- `src/server/http/cookies.ts`
- `src/server/http/responses.ts`
- `src/server/auth/session.ts`
- `src/server/mal/validation.ts`
- `src/server/mal/oauth.ts`
- `src/server/mal/client.ts`
- `src/lib/auth-session.ts`
- `src/app/api/seasonal/route.ts`
- `src/app/api/anime/anime_details/route.ts`
- `src/app/api/cron/isr_warmUp/warmUp/route.ts`
- `src/app/api/users/auth/authorize/route.ts`
- `src/app/api/users/auth/callback/route.ts`
- `src/app/api/users/auth/log_out/route.ts`
- `src/app/api/users/auth/refresh_accesstoken/route.ts`
- `src/app/api/users/auth/session/route.ts`
- `src/app/api/users/data/user_data/route.ts`
- `src/app/api/users/data/userlist/route.ts`
- `src/app/api/users/data/save_anime/route.ts`
- `src/app/api/users/data/delete_anime/route.ts`

Client migration notes:

- Main auth/session consumers now use `src/lib/auth-session.ts` and `/api/users/auth/session`.
- Duplicated tracking-page note text now uses the session endpoint instead of reading the readable legacy `expires_in` cookie.
- There is no remaining `src/lib/client-cookies.ts` bridge in this task.

Compatibility notes:

- `/api/users/data/user_data` returns both `success` and legacy `succes` keys for now.
- `save_anime` and `delete_anime` now return corrected messages: `successfully updated` and `successfully deleted`.
- Legacy GET mutation requests with neither `Origin` nor `Referer` are still allowed to preserve existing callers. Cross-origin requests with a mismatched `Origin` or `Referer` return `403`.
- Refresh-token responses that omit `refresh_token` fail closed through token-response validation.

Verification run:

```powershell
npm run test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
rg -n "nookies|next/dist/compiled|parseCookies|client-cookies" src public tests package.json package-lock.json
npm ls nookies --depth=0
```

Results:

- Vitest: 8 files passed, 107 tests passed.
- Typecheck: passed.
- Lint: passed with existing warnings only.
- Build: passed; build output lists all `/api/**` routes under App Router.
- Playwright: 2 smoke tests passed.
- `nookies` / client-cookie-parser audit: no matches.
- `npm ls nookies --depth=0`: empty.
