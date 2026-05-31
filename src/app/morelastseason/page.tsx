import SeasonListClient from "../_components/SeasonListClient";
import { getSeasonWindow } from "@/server/seasonal/page-season";
import { fetchCachedMalSeasonOrEmpty } from "@/server/seasonal/mal-season-pages";

export const revalidate = 43200;

export default async function MoreLastSeasonPage() {
  const seasonWindow = getSeasonWindow();
  const initialItems = await fetchCachedMalSeasonOrEmpty({
    year: seasonWindow.past_year,
    season: seasonWindow.past_season,
  });

  return (
    <SeasonListClient
      title="Last Season"
      initialItems={initialItems}
      detailHrefPrefix="/morelastseason"
      season={seasonWindow.past_season}
      year={seasonWindow.past_year}
    />
  );
}
