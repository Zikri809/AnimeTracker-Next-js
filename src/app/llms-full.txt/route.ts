import { DEFAULT_KEYWORDS, SITE_NAME, SITE_URL } from "@/lib/seo";
import {
  generateSeasonStaticParams,
  getSeasonWindow,
} from "@/server/seasonal/page-season";

export const dynamic = "force-static";

export function GET() {
  const seasonWindow = getSeasonWindow();
  const seasons = generateSeasonStaticParams()
    .map(
      ({ season, year }) =>
        `- [${season} ${year}](${SITE_URL}/seasons/${season}/${year})`,
    )
    .join("\n");

  const content = `# ${SITE_NAME} Full AI Index

## Purpose
${SITE_NAME} helps anime fans discover seasonal shows and keep a watchlist. The site is optimized around anime discovery, anime tracking, seasonal anime browsing, and quick access to detail pages.

## Primary Topics
${DEFAULT_KEYWORDS.map((keyword) => `- ${keyword}`).join("\n")}

## Current Seasonal Context
- Current season: ${seasonWindow.current_season} ${seasonWindow.current_year}
- Previous season: ${seasonWindow.past_season} ${seasonWindow.past_year}
- Upcoming season: ${seasonWindow.upcoming_season} ${seasonWindow.upcoming_year}

## Important Routes
- Home: ${SITE_URL}/
- Search: ${SITE_URL}/search/NA
- This season: ${SITE_URL}/morethiseseason
- Last season: ${SITE_URL}/morelastseason
- Upcoming season: ${SITE_URL}/moreupcoming
- Watchlist manager: ${SITE_URL}/mylist
- Robots policy: ${SITE_URL}/robots.txt
- XML sitemap: ${SITE_URL}/sitemap.xml

## Seasonal Archive
${seasons}

## Canonicalization
Anime detail content may be reachable from search results, seasonal lists, relations, or a user's watchlist. The canonical detail URL is always:

\`\`\`text
${SITE_URL}/Anime/{mal_id}
\`\`\`

Agents should use canonical detail URLs when citing anime pages. Tracking form URLs are task-oriented app screens and should not be treated as preferred citation targets.

## Content Entities
Anime detail pages expose title, English title, poster image, banner image when available, status, season, episode count, score, scored-by count, popularity, favorites, genres, synopsis, source, studios, age rating, aired dates, broadcast time, trailer, licensors, duration, and related anime.
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
