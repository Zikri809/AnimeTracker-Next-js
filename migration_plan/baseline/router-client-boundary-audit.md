# Router and Client Boundary Audit

This audit documents the Task 04 implementation state after the router/client-boundary work and the JavaScript-to-TypeScript file conversions made during that work.

## Shared Files Fixed by this Task

The following shared files no longer import `next/router` and now receive route details through compatibility adapters or pure function arguments:

1. `src/ComponentsSelf/add to watchlist button.tsx`
2. `src/ComponentsSelf/animecardhorizontal.tsx`
3. `src/ComponentsSelf/detailednavbar.tsx`
4. `src/ComponentsSelf/detailedrelationnavbar.tsx`
5. `src/ComponentsSelf/min.tsx`
6. `src/ComponentsSelf/mylistnavbar.tsx`
7. `src/ComponentsSelf/restore components/uploadbackup.tsx`
8. `src/ComponentsSelf/searchnavbar.tsx`
9. `src/ComponentsSelf/trackingformnavbar.tsx`
10. `src/hooks/use-current-route.ts`
11. `src/hooks/use-scroll-saver.ts`
12. `src/Utility/ScrollSaver.ts`
13. `src/Utility/loadfromlocal.tsx`
14. `src/Utility/tracking/savehandler_tracking.ts`
15. `src/Utility/tracking/deleteshow_tracking.ts`
16. `src/Utility/tracking/lastclick_tracking.ts`
17. `src/lib/routing/path-utils.ts`

## Client-Boundary Files Marked in this Task

The following shared interactive components/hooks are marked with `"use client"`:

- `src/ComponentsSelf/add to watchlist button.tsx`
- `src/ComponentsSelf/animecardhorizontal.tsx`
- `src/ComponentsSelf/detailednavbar.tsx`
- `src/ComponentsSelf/detailedrelationnavbar.tsx`
- `src/ComponentsSelf/min.tsx`
- `src/ComponentsSelf/mylistnavbar.tsx`
- `src/ComponentsSelf/restore components/uploadbackup.tsx`
- `src/ComponentsSelf/searchnavbar.tsx`
- `src/ComponentsSelf/trackingformnavbar.tsx`
- `src/hooks/use-current-route.ts`
- `src/hooks/use-scroll-saver.ts`
- `src/hooks/useSwipeGesture.ts`
- `src/Utility/ScrollSaver.ts`
- `src/components/ui/avatar.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/progress.tsx`
- `src/components/ui/radio-group.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/sonner.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/toggle-group.tsx`

## Scope Note

Task 04's original non-goal was to avoid route-file migration. The implementation converted many `src/pages/**` route files from `.js`/`.jsx` to `.tsx`, but those files still intentionally use Pages Router APIs until Tasks 06, 07, and 08 migrate route semantics into `src/app`.

## Deferred Route-File Imports

The remaining `next/router` imports should be route-file-only work under `src/pages/**`.

### Task 06: Static and List Routes

- `src/pages/index.js`
- `src/pages/morelastseason/index.tsx`
- `src/pages/morethiseseason/index.tsx`
- `src/pages/moreupcoming/index.tsx`
- `src/pages/search/[title]/index.tsx`
- `src/pages/seasons/[season]/[year]/index.tsx`

### Task 07: Detail, Relation, and Tracking Routes

- `src/pages/Anime/[mal_id]/index.tsx`
- `src/pages/Anime/[mal_id]/relation/[relation_id]/index.tsx`
- `src/pages/Anime/[mal_id]/relation/[relation_id]/tracking/index.tsx`
- `src/pages/Anime/[mal_id]/tracking/index.tsx`
- `src/pages/morelastseason/[mal_id]/index.tsx`
- `src/pages/morelastseason/[mal_id]/relation/[relation_id]/index.tsx`
- `src/pages/morelastseason/[mal_id]/relation/[relation_id]/tracking/index.tsx`
- `src/pages/morelastseason/[mal_id]/tracking/index.tsx`
- `src/pages/morethiseseason/[mal_id]/index.tsx`
- `src/pages/morethiseseason/[mal_id]/relation/[relation_id]/index.tsx`
- `src/pages/morethiseseason/[mal_id]/relation/[relation_id]/tracking/index.tsx`
- `src/pages/morethiseseason/[mal_id]/tracking/index.tsx`
- `src/pages/moreupcoming/[mal_id]/index.tsx`
- `src/pages/moreupcoming/[mal_id]/relation/[relation_id]/index.tsx`
- `src/pages/moreupcoming/[mal_id]/relation/[relation_id]/tracking/index.tsx`
- `src/pages/moreupcoming/[mal_id]/tracking/index.tsx`
- `src/pages/mylist/[mylist_tab]/[mal_id]/index.tsx`
- `src/pages/mylist/[mylist_tab]/[mal_id]/relation/[relation_id]/index.tsx`
- `src/pages/mylist/[mylist_tab]/[mal_id]/relation/[relation_id]/tracking/index.tsx`
- `src/pages/mylist/[mylist_tab]/[mal_id]/tracking/index.tsx`
- `src/pages/search/[title]/[mal_id]/index.tsx`
- `src/pages/search/[title]/[mal_id]/relation/[relation_id]/index.tsx`
- `src/pages/search/[title]/[mal_id]/relation/[relation_id]/tracking/index.tsx`
- `src/pages/search/[title]/[mal_id]/tracking/index.tsx`
- `src/pages/seasons/[season]/[year]/[mal_id]/index.tsx`
- `src/pages/seasons/[season]/[year]/[mal_id]/relation/[relation_id]/index.tsx`
- `src/pages/seasons/[season]/[year]/[mal_id]/relation/[relation_id]/tracking/index.tsx`
- `src/pages/seasons/[season]/[year]/[mal_id]/tracking/index.tsx`

### Task 08: Mylist, Auth, and Worker Flows

- `src/pages/ExceedRetryLimit/index.tsx`
- `src/pages/mylist/index.tsx`
