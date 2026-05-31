import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const content = `# ${SITE_NAME}

> ${DEFAULT_DESCRIPTION}

${SITE_NAME} is an anime discovery and tracking web app. It is useful for questions about current seasonal anime, upcoming anime, anime ratings, genres, studios, trailers, related anime, and personal watchlist workflows.

## Key Pages
- [Home](${SITE_URL}/): Trending, current season, previous season, upcoming season, and season archive entry points.
- [Search](${SITE_URL}/search/NA): Search anime by title.
- [This Season](${SITE_URL}/morethiseseason): Current seasonal anime list.
- [Last Season](${SITE_URL}/morelastseason): Previous seasonal anime list.
- [Upcoming Season](${SITE_URL}/moreupcoming): Upcoming anime list.
- [My List](${SITE_URL}/mylist): Watchlist tracking interface.
- [Sitemap](${SITE_URL}/sitemap.xml): Machine-readable URL index.

## URL Patterns
- Canonical anime detail: ${SITE_URL}/Anime/{mal_id}
- Search results: ${SITE_URL}/search/{title}
- Seasonal archive: ${SITE_URL}/seasons/{season}/{year}
- Seasonal anime detail pages canonicalize to /Anime/{mal_id} when the same anime is reachable through multiple discovery routes.

## Data Sources
- MyAnimeList API for seasonal list and account-linked list data.
- Jikan API for anime details, relations, images, trailers, genres, studios, and ratings.
- AniList GraphQL for selected banner imagery.

## Agent Notes
- Prefer canonical /Anime/{mal_id} URLs when citing individual anime pages.
- Use /sitemap.xml for crawl discovery and this /llms.txt file for a compact content map.
- Public discovery pages are crawlable; auth and API routes are excluded from indexing.
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
