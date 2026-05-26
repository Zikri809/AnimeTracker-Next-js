# Baseline Route Inventory

This inventory reflects the current Pages Router app before migration.

## User-Facing Pages

| Current route | Current file | Baseline status |
| --- | --- | --- |
| `/` | `src/pages/index.js` | HTTP 200 after CDN host fix |
| `/search/[title]` | `src/pages/search/[title]/index.js` | HTTP 200 for `/search/NA` |
| `/Anime/[mal_id]` | `src/pages/Anime/[mal_id]/index.js` | HTTP 200 for `/Anime/1` |
| `/Anime/[mal_id]/tracking` | `src/pages/Anime/[mal_id]/tracking/index.jsx` | HTTP 200 for `/Anime/1/tracking` |
| `/Anime/[mal_id]/relation/[relation_id]` | `src/pages/Anime/[mal_id]/relation/[relation_id]/index.jsx` | Build route exists |
| `/Anime/[mal_id]/relation/[relation_id]/tracking` | `src/pages/Anime/[mal_id]/relation/[relation_id]/tracking/index.jsx` | Build route exists |
| `/morethiseseason` | `src/pages/morethiseseason/index.js` | HTTP 200 |
| `/morethiseseason/[mal_id]` | `src/pages/morethiseseason/[mal_id]/index.js` | Build route exists |
| `/morethiseseason/[mal_id]/tracking` | `src/pages/morethiseseason/[mal_id]/tracking/index.jsx` | Build route exists |
| `/morethiseseason/[mal_id]/relation/[relation_id]` | `src/pages/morethiseseason/[mal_id]/relation/[relation_id]/index.jsx` | Build route exists |
| `/morethiseseason/[mal_id]/relation/[relation_id]/tracking` | `src/pages/morethiseseason/[mal_id]/relation/[relation_id]/tracking/index.jsx` | Build route exists |
| `/morelastseason` | `src/pages/morelastseason/index.js` | HTTP 200 |
| `/morelastseason/[mal_id]` | `src/pages/morelastseason/[mal_id]/index.js` | Build route exists |
| `/morelastseason/[mal_id]/tracking` | `src/pages/morelastseason/[mal_id]/tracking/index.jsx` | Build route exists |
| `/morelastseason/[mal_id]/relation/[relation_id]` | `src/pages/morelastseason/[mal_id]/relation/[relation_id]/index.jsx` | Build route exists |
| `/morelastseason/[mal_id]/relation/[relation_id]/tracking` | `src/pages/morelastseason/[mal_id]/relation/[relation_id]/tracking/index.jsx` | Build route exists |
| `/moreupcoming` | `src/pages/moreupcoming/index.js` | HTTP 200 |
| `/moreupcoming/[mal_id]` | `src/pages/moreupcoming/[mal_id]/index.js` | Build route exists |
| `/moreupcoming/[mal_id]/tracking` | `src/pages/moreupcoming/[mal_id]/tracking/index.jsx` | Build route exists |
| `/moreupcoming/[mal_id]/relation/[relation_id]` | `src/pages/moreupcoming/[mal_id]/relation/[relation_id]/index.jsx` | Build route exists |
| `/moreupcoming/[mal_id]/relation/[relation_id]/tracking` | `src/pages/moreupcoming/[mal_id]/relation/[relation_id]/tracking/index.jsx` | Build route exists |
| `/seasons/[season]/[year]` | `src/pages/seasons/[season]/[year]/index.js` | HTTP 200 for `/seasons/spring/2026` |
| `/seasons/[season]/[year]/[mal_id]` | `src/pages/seasons/[season]/[year]/[mal_id]/index.js` | Build route exists |
| `/seasons/[season]/[year]/[mal_id]/tracking` | `src/pages/seasons/[season]/[year]/[mal_id]/tracking/index.jsx` | Build route exists |
| `/seasons/[season]/[year]/[mal_id]/relation/[relation_id]` | `src/pages/seasons/[season]/[year]/[mal_id]/relation/[relation_id]/index.jsx` | Build route exists |
| `/seasons/[season]/[year]/[mal_id]/relation/[relation_id]/tracking` | `src/pages/seasons/[season]/[year]/[mal_id]/relation/[relation_id]/tracking/index.jsx` | Build route exists |
| `/mylist` | `src/pages/mylist/index.jsx` | HTTP 200 with empty-storage state |
| `/mylist/login` | `src/pages/mylist/login/index.js` | Build route exists |
| `/mylist/login_success` | `src/pages/mylist/login_success/index.js` | Build route exists |
| `/mylist/login_failed` | `src/pages/mylist/login_failed/index.js` | Build route exists |
| `/mylist/logout_success` | `src/pages/mylist/logout_success/index.js` | Build route exists |
| `/mylist/user_profile` | `src/pages/mylist/user_profile/index.js` | Build route exists |
| `/mylist/[mylist_tab]/[mal_id]` | `src/pages/mylist/[mylist_tab]/[mal_id]/index.js` | Build route exists |
| `/mylist/[mylist_tab]/[mal_id]/tracking` | `src/pages/mylist/[mylist_tab]/[mal_id]/tracking/index.jsx` | Build route exists |
| `/mylist/[mylist_tab]/[mal_id]/relation/[relation_id]` | `src/pages/mylist/[mylist_tab]/[mal_id]/relation/[relation_id]/index.jsx` | Build route exists |
| `/mylist/[mylist_tab]/[mal_id]/relation/[relation_id]/tracking` | `src/pages/mylist/[mylist_tab]/[mal_id]/relation/[relation_id]/tracking/index.jsx` | Build route exists |
| `/ExceedRetryLimit` | `src/pages/ExceedRetryLimit/index.js` | Build route exists |
| `/testbed` | `src/pages/testbed/index.js` | Build route exists |

## API Routes

| Current route | Current file |
| --- | --- |
| `/api/seasonal` | `src/pages/api/seasonal.js` |
| `/api/anime/anime_details` | `src/pages/api/anime/anime_details.js` |
| `/api/cron/isr_warmUp/warmUp` | `src/pages/api/cron/isr_warmUp/warmUp.js` |
| `/api/users/auth/authorize` | `src/pages/api/users/auth/authorize.js` |
| `/api/users/auth/callback` | `src/pages/api/users/auth/callback.js` |
| `/api/users/auth/log_out` | `src/pages/api/users/auth/log_out.js` |
| `/api/users/auth/refresh_accesstoken` | `src/pages/api/users/auth/refresh_accesstoken.js` |
| `/api/users/data/user_data` | `src/pages/api/users/data/user_data.js` |
| `/api/users/data/userlist` | `src/pages/api/users/data/userlist.js` |
| `/api/users/data/save_anime` | `src/pages/api/users/data/save_anime.js` |
| `/api/users/data/delete_anime` | `src/pages/api/users/data/delete_anime.js` |

## App Router Migration Notes

- All user-facing pages still live under `src/pages`.
- All API routes still live under `src/pages/api`.
- No `src/app` directory exists at baseline.
- The migration should preserve every public route listed here unless a redirect is explicitly documented.
