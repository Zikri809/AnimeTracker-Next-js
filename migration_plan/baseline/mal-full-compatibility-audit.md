# Full MAL API Compatibility Audit

Captured on 2026-05-31 for `C:\AnimeTracker-Next-js`.

## Verdict

Using MyAnimeList API v2 as the canonical anime data source is compatible with the app's core flows and is the cleaner migration target for Task 07.

The app can drop the current `Jikan -> MAL-like` conversion as a central architecture. MAL already returns the same node shape used by local watchlists and authenticated list sync for search, seasonal/list pages, ranking/trending, details, relations, and user anime list data.

Do not promise a 100% visual-equivalent replacement without small UI decisions. MAL does not expose every rich Jikan field currently rendered on detail pages.

Recommended direction:

- make MAL API the source of truth for anime search, seasonal/list pages, detail pages, relation routes, tracking pages, user list sync, save, and delete;
- keep one app-owned `AnimeViewModel` normalizer for display formatting and optional-field safety;
- remove `jikantomalformat` from the migration path;
- either remove/fallback UI for fields MAL does not provide or keep Jikan as an explicit optional enrichment source only for those fields.

## Sources Checked

- Official MAL API v2 docs: `https://myanimelist.net/apiconfig/references/api/v2`
- Local MAL client: `src/server/mal/client.ts`
- Local route handlers:
  - `src/app/api/seasonal/route.ts`
  - `src/app/api/anime/anime_details/route.ts`
  - `src/app/api/users/data/userlist/route.ts`
  - `src/app/api/users/data/save_anime/route.ts`
  - `src/app/api/users/data/delete_anime/route.ts`
- Current Jikan usage inventory from `rg -n 'api\.jikan\.moe/v4' src tests migration_plan`.

## Live Probe

Using the local `.env` `Client_ID`, without printing the secret, these MAL endpoints responded successfully with client auth:

- `GET /v2/anime/1`
- `GET /v2/anime/season/2026/spring`
- `GET /v2/anime?q=cowboy%20bebop`
- `GET /v2/anime/ranking?ranking_type=airing`

The detail probe requested:

```text
id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,media_type,status,genres,num_episodes,start_season,broadcast,source,average_episode_duration,rating,pictures,background,related_anime,related_manga,recommendations,studios,statistics
```

Observed detail keys:

```text
id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,media_type,status,genres,num_episodes,start_season,broadcast,source,average_episode_duration,rating,pictures,background,related_anime,related_manga,recommendations,studios,statistics
```

Observed relation shape:

```ts
{
  node: { id: 5, title: "...", main_picture: { medium: "...", large: "..." } },
  relation_type: "side_story",
  relation_type_formatted: "Side story"
}
```

Observed broadcast shape:

```ts
{
  day_of_the_week: "saturday",
  start_time: "01:00"
}
```

Confirmed missing from MAL detail response and official docs:

- trailer/video embed URL;
- favorites count;
- producers;
- licensors;
- themes;
- demographics;
- opening/ending themes.

## Endpoint Compatibility

| App flow | Current source | MAL replacement | Compatibility | Notes |
| --- | --- | --- | --- | --- |
| Detail page | Jikan `/anime/:id/full` | `GET /anime/{anime_id}?fields=...` | Strong | Client auth works; no OAuth needed for public detail. |
| Relation detail | Jikan `/anime/:id/full` plus `/relations` | `GET /anime/{anime_id}?fields=related_anime,...` | Strong | MAL relation entries include target node and formatted relation type. |
| Tracking page data | Jikan detail converted by `jikantomalformat` | `GET /anime/{anime_id}?fields=...` | Strong | MAL already returns `node` fields used by localStorage. |
| Search results | Jikan `/anime?q=...` | `GET /anime?q=...&fields=...` | Strong | Supports pagination with `limit` and `offset`, not Jikan-style `page`; update infinite scroll math. |
| Seasonal pages | Jikan seasonal in older code, MAL in newer App Router code | `GET /anime/season/{year}/{season}` | Already mostly migrated | Current `src/server/seasonal/mal-season-pages.ts` already uses MAL. |
| Trending/airing | Jikan `/top/anime?filter=airing` | `GET /anime/ranking?ranking_type=airing` | Strong | Ranking endpoint supports `airing`, `upcoming`, `bypopularity`, `favorite`, etc. |
| User list sync | MAL | `GET /users/@me/animelist` | Already MAL | Keep OAuth flow. |
| Save tracking | MAL | `PUT /anime/{anime_id}/my_list_status` | Already MAL | Existing route handler uses `saveAnime`. |
| Delete tracking | MAL | `DELETE /anime/{anime_id}/my_list_status` | Already MAL | Existing route handler uses `deleteAnime`. |
| Home spotlight banner | AniList GraphQL | MAL has no banner image field | Not equivalent | Either keep AniList for banner art or redesign spotlight to use MAL posters/pictures. |
| Retry page behavior | Jikan failure retries | MAL failure retries | Compatible | Preserve `/ExceedRetryLimit` route contract. |

## Field Mapping

| Current app/Jikan field | MAL field | Status | Migration note |
| --- | --- | --- | --- |
| `mal_id` | `id` | Direct | Rename internally to `id` or `malId`, but preserve route param `mal_id`. |
| `images.webp.large_image_url` | `main_picture.large` | Direct enough | MAL returns JPG URLs, not WebP; current UI only needs a renderable poster URL. |
| `images.jpg.large_image_url` fallback | `main_picture.medium` | Direct fallback | Use local placeholder when both are missing. |
| `title` | `title` | Direct | Use as default display title. |
| `title_english` | `alternative_titles.en` | Direct | May be absent. |
| `title_japanese` | `alternative_titles.ja` | Direct | May be absent. |
| `title_synonyms` | `alternative_titles.synonyms` | Direct | Array may be empty. |
| `type` | `media_type` | Direct with formatting | MAL enum values need display formatting. |
| `source` | `source` | Direct with formatting | MAL enum values need display formatting. |
| `episodes` | `num_episodes` | Direct | Keep safe `0` for progress controls when unknown. |
| `status` | `status` | Direct with formatting | MAL values are underscore enums like `finished_airing`; detail UI currently expects labels like `Finished Airing`. |
| `airing` | derive from `status` | Derived | `currently_airing` maps to `true`. |
| `season` + `year` | `start_season.season` + `start_season.year` | Direct | Existing MAL seasonal code already uses this. |
| `aired.from` / `aired.to` / `aired.string` | `start_date` / `end_date` | Partial | Build our own display string; MAL does not return Jikan's ready-made `aired.string`. |
| `duration` | `average_episode_duration` | Derived | MAL returns seconds; format into `24 min per ep` or similar. |
| `rating` | `rating` | Direct with mapping | MAL returns enum-like values such as `r`; map to human labels if desired. |
| `score` | `mean` | Direct | Existing MAL list code already uses this. |
| `scored_by` | `num_scoring_users` | Direct | Existing list UI already uses this. |
| `rank` | `rank` | Direct | Consider using true rank where the UI says ranking. Some old pages pass popularity into `ranking`. |
| `popularity` | `popularity` | Direct | Keep separate from rank. |
| `members` | `num_list_users` | Direct | Use where member count is needed. |
| `favorites` | none | Gap | Remove the field, show `Unknown`, or explicitly enrich from another source. |
| `synopsis` | `synopsis` | Direct | Optional; guard null/empty. |
| `background` | `background` | Direct | Optional. |
| `broadcast.day/time/timezone/string` | `broadcast.day_of_the_week`, `broadcast.start_time` | Partial | No timezone in observed MAL response. Build display defensively. |
| `studios[]` | `studios[]` | Direct | Shape is `{ id, name }`. |
| `genres[]` | `genres[]` | Direct | Shape is `{ id, name }`. |
| `trailer.embed_url` | none | Gap | Biggest detail-page visual gap. Keep Jikan enrichment, remove trailer UI, or add a separate video provider strategy. |
| `licensors[]` / typo `liscensor` | none | Gap | Current code already typo-checks `liscensor`; MAL does not provide licensors. |
| `producers[]` | none | Gap | Not currently prominent in App Router list shell. |
| `themes[]` / `demographics[]` | none | Gap | Not available in official MAL fields. |
| Jikan `/relations` `relation` + `entry[]` | `related_anime[]` | Direct enough | Use `relation_type_formatted` as heading and `node` as entry. Adaptation entries can remain plain text if desired. |
| `node.list_status` | `my_list_status` / local `list_status` | Direct for authenticated, local for anonymous | Keep localStorage shape compatible with MAL list item shape. |

## Existing Code Impact

### Remove or Replace

- `src/Utility/tracking/jikantomalformat.js`
  - Replace with a MAL normalizer that is mostly identity-shaped.
- Jikan detail fetches in all duplicated detail/tracking route files under:
  - `src/pages/Anime/**`
  - `src/pages/morethiseseason/**`
  - `src/pages/morelastseason/**`
  - `src/pages/moreupcoming/**`
  - `src/pages/search/[title]/[mal_id]/**`
  - `src/pages/mylist/[mylist_tab]/[mal_id]/**`
  - `src/pages/seasons/[season]/[year]/[mal_id]/**`
- `src/ComponentsSelf/min.tsx`
  - Replace Jikan `/relations` fetch with MAL detail `related_anime` data passed from the detail response.
- `src/pages/search/[title]/index.tsx`
  - Replace Jikan search with MAL search and offset pagination.
- `src/ComponentsSelf/trending.tsx`
  - Replace Jikan top airing with MAL ranking `ranking_type=airing`.
- `src/server/seasonal/home-page-data.ts`
  - Replace `fetchJikanSeasonCards` with a MAL-backed helper or reuse `fetchCachedMalSeason`.
- `src/Utility/validation.js`
  - Replace Jikan validation fetch with MAL detail or remove if the worker sync flow no longer needs this stale shape.

### Keep and Expand

- `src/server/mal/client.ts`
  - Add public client-auth detail/search/ranking helpers.
  - Current `fetchAnimeDetails` requires an access token; that is too strict for public detail pages.
- `src/server/mal/validation.ts`
  - Add validation for ranking type and MAL search `q`, `limit`, and `offset`.
- Existing route handlers for user list/save/delete.
- Existing localStorage watchlist keys and MAL-like list item shape.

## Required MAL Client Changes

Add constants:

```ts
export const MAL_COMMON_ANIME_FIELDS =
  "id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,media_type,status,genres,num_episodes,start_season,broadcast,source,average_episode_duration,rating,pictures,background,related_anime,related_manga,recommendations,studios,statistics";
```

Add public helpers:

```ts
fetchPublicAnimeDetails(id, fields = MAL_COMMON_ANIME_FIELDS)
fetchAnimeSearch(query, { limit, offset, fields })
fetchAnimeRanking(rankingType, { limit, offset, fields })
fetchAnimeSeason(year, season, { limit, offset, sort, fields })
```

Keep authenticated helpers:

```ts
fetchUserList(accessToken, status, sort, offset)
saveAnime(accessToken, animeId, status, score, episode)
deleteAnime(accessToken, animeId)
```

Public helpers should use:

```ts
headers: { "X-MAL-CLIENT-ID": clientId }
```

Authenticated helpers should continue using:

```ts
headers: { Authorization: `Bearer ${accessToken}` }
```

For detail pages, optionally include `my_list_status` only when an OAuth access token is present. Public client-auth detail should not depend on user auth.

## Migration Risk

Low risk for core app behavior:

- route IDs map cleanly;
- relations map cleanly;
- local tracking shape already matches MAL much better than Jikan;
- seasonal App Router work is already MAL-oriented;
- save/delete/userlist are already MAL.

Medium risk for visual parity:

- trailer iframe cannot be supplied by MAL;
- favorites count cannot be supplied by MAL;
- licensors/producers/themes/demographics cannot be supplied by MAL;
- date/duration/rating/status labels need formatting.

Medium risk for pagination:

- Jikan search uses `page`;
- MAL search/ranking/season use `offset`;
- update infinite-scroll cache keys and tests.

## Recommendation for Task 07

Revise Task 07 before implementation:

- replace "Shared Jikan Data Layer" with "Shared MAL Anime Data Layer";
- replace "Shared Jikan-to-MAL mapping" with "MAL Anime View Model";
- keep tests for optional fields because MAL still returns partial data;
- add tests that public detail/search/ranking/seasonal requests use `X-MAL-CLIENT-ID`;
- add tests that authenticated save/delete/userlist use `Authorization: Bearer`;
- remove `jikantomalformat` from the deliverables;
- add an explicit product decision for trailer/favorites:
  - remove from UI,
  - show fallback/unknown,
  - or keep Jikan as a named enrichment source only for those fields.

Preferred implementation strategy:

1. Build `src/server/mal/anime.ts` with public MAL helpers and shared field constants.
2. Build `src/server/mal/anime-normalize.ts` to map MAL enums and optional fields into UI labels.
3. Migrate search/trending/home seasonal helpers off Jikan.
4. Migrate detail/tracking route families using MAL detail and `related_anime`.
5. Delete `jikantomalformat` and Jikan detail/relation fetches.
6. Run an `rg 'api\.jikan\.moe' src` gate. Any remaining Jikan usage must be an explicit enrichment exception with tests.

## Final Compatibility Decision

Full MAL is okay for maintainability and should be the new primary architecture.

The only blocker to "MAL for literally every visual field" is rich metadata not exposed by official MAL API. That is a product/UI decision, not an architectural blocker.
