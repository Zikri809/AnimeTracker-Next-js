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
  title: "This Season Anime",
  description:
    "Browse anime airing this season with ratings, posters, episode counts, genres, and quick links to detailed anime pages.",
  path: "/morethiseseason",
  keywords: [
    "this season anime",
    "current seasonal anime",
    "currently airing anime",
    "anime tracker",
  ],
});

export default async function MoreThisSeasonPage() {
  const seasonWindow = getSeasonWindow();
  const initialItems = await fetchCachedMalSeasonOrEmpty({
    year: seasonWindow.current_year,
    season: seasonWindow.current_season,
  });
  const itemListJsonLd = createSeasonItemListJsonLd({
    name: "This Season Anime",
    path: "/morethiseseason",
    items: initialItems,
    detailHrefPrefix: "/morethiseseason",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(itemListJsonLd) }}
      />
      <SeasonListClient
        title="This Season"
        initialItems={initialItems}
        detailHrefPrefix="/morethiseseason"
        season={seasonWindow.current_season}
        year={seasonWindow.current_year}
      />
    </>
  );
}
