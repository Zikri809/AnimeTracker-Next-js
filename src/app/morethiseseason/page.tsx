import SeasonListClient from "../_components/SeasonListClient";
import { getSeasonWindow } from "@/server/seasonal/page-season";
import { fetchCachedMalSeasonOrEmpty } from "@/server/seasonal/mal-season-pages";

export const revalidate = 43200;

export default async function MoreThisSeasonPage() {
  const seasonWindow = getSeasonWindow();
  const initialItems = await fetchCachedMalSeasonOrEmpty({
    year: seasonWindow.current_year,
    season: seasonWindow.current_season,
  });

  return (
    <SeasonListClient
      title="This Season"
      initialItems={initialItems}
      detailHrefPrefix="/morethiseseason"
      season={seasonWindow.current_season}
      year={seasonWindow.current_year}
    />
  );
}
