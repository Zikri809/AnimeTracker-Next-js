import SeasonListClient from "../_components/SeasonListClient";
import { getSeasonWindow } from "@/server/seasonal/page-season";
import { fetchCachedMalSeasonOrEmpty } from "@/server/seasonal/mal-season-pages";
import { createMetadata } from "@/lib/seo";
import {
  createSeasonItemListJsonLd,
  stringifyJsonLd,
} from "@/lib/structured-data";

export const revalidate = 43200;

export const metadata = createMetadata({
  title: "Upcoming Anime",
  description:
    "Discover upcoming anime releases with posters, ratings as they become available, episode counts, genres, and watchlist tracking.",
  path: "/moreupcoming",
  keywords: [
    "upcoming anime",
    "new anime releases",
    "future anime seasons",
    "anime watchlist",
  ],
});

export default async function MoreUpcomingPage() {
  const seasonWindow = getSeasonWindow();
  const initialItems = await fetchCachedMalSeasonOrEmpty({
    year: seasonWindow.upcoming_year,
    season: seasonWindow.upcoming_season,
  });
  const itemListJsonLd = createSeasonItemListJsonLd({
    name: "Upcoming Anime",
    path: "/moreupcoming",
    items: initialItems,
    detailHrefPrefix: "/moreupcoming",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(itemListJsonLd) }}
      />
      <SeasonListClient
        title="Upcoming Season"
        initialItems={initialItems}
        detailHrefPrefix="/moreupcoming"
        season={seasonWindow.upcoming_season}
        year={seasonWindow.upcoming_year}
      />
    </>
  );
}
