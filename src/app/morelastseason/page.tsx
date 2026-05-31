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
  title: "Last Season Anime",
  description:
    "Browse last season's anime with ratings, posters, episode counts, genres, and quick links to detailed anime pages.",
  path: "/morelastseason",
  keywords: [
    "last season anime",
    "previous season anime",
    "seasonal anime list",
    "anime tracker",
  ],
});

export default async function MoreLastSeasonPage() {
  const seasonWindow = getSeasonWindow();
  const initialItems = await fetchCachedMalSeasonOrEmpty({
    year: seasonWindow.past_year,
    season: seasonWindow.past_season,
  });
  const itemListJsonLd = createSeasonItemListJsonLd({
    name: "Last Season Anime",
    path: "/morelastseason",
    items: initialItems,
    detailHrefPrefix: "/morelastseason",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(itemListJsonLd) }}
      />
      <SeasonListClient
        title="Last Season"
        initialItems={initialItems}
        detailHrefPrefix="/morelastseason"
        season={seasonWindow.past_season}
        year={seasonWindow.past_year}
      />
    </>
  );
}
