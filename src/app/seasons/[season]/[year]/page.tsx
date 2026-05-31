import { notFound } from "next/navigation";
import SeasonListClient from "../../../_components/SeasonListClient";
import {
  validateSeasonParam,
  validateYearParam,
  formatSeasonTitle,
  generateSeasonStaticParams,
} from "@/server/seasonal/page-season";
import { fetchCachedMalSeasonOrEmpty } from "@/server/seasonal/mal-season-pages";

export const revalidate = 43200;
export const dynamicParams = true;

type SeasonPageProps = {
  params: Promise<{ season: string; year: string }>;
};

export function generateStaticParams() {
  return generateSeasonStaticParams();
}

export default async function Page({ params }: SeasonPageProps) {
  const { season: rawSeason, year: rawYear } = await params;

  const season = validateSeasonParam(rawSeason);
  const year = validateYearParam(rawYear);

  if (!season || year === null) {
    notFound();
  }

  const initialItems = await fetchCachedMalSeasonOrEmpty({
    year,
    season,
  });

  const title = formatSeasonTitle(season, year);

  return (
    <SeasonListClient
      title={title}
      initialItems={initialItems}
      detailHrefPrefix={`/seasons/${season}/${year}`}
      season={season}
      year={year}
    />
  );
}
