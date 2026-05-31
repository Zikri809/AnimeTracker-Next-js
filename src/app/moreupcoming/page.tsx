import SeasonListClient from "../_components/SeasonListClient";
import { getSeasonWindow } from "@/server/seasonal/page-season";
import { fetchCachedMalSeasonOrEmpty } from "@/server/seasonal/mal-season-pages";

export const revalidate = 43200;

export default async function MoreUpcomingPage() {
  const seasonWindow = getSeasonWindow();
  const initialItems = await fetchCachedMalSeasonOrEmpty({
    year: seasonWindow.upcoming_year,
    season: seasonWindow.upcoming_season,
  });

  return (
    <SeasonListClient
      title="Upcoming Season"
      initialItems={initialItems}
      detailHrefPrefix="/moreupcoming"
      season={seasonWindow.upcoming_season}
      year={seasonWindow.upcoming_year}
    />
  );
}
