import { notFound } from "next/navigation";
import SeasonListClient from "../../../_components/SeasonListClient";
import {
  validateSeasonParam,
  validateYearParam,
  formatSeasonTitle,
  generateSeasonStaticParams,
} from "@/server/seasonal/page-season";
import { fetchCachedMalSeasonOrEmpty } from "@/server/seasonal/mal-season-pages";
import { createMetadata } from "@/lib/seo";
import {
  createSeasonItemListJsonLd,
  stringifyJsonLd,
} from "@/lib/structured-data";

export const revalidate = 43200;
export const dynamicParams = true;

type SeasonPageProps = {
  params: Promise<{ season: string; year: string }>;
};

export async function generateMetadata({ params }: SeasonPageProps) {
  const { season: rawSeason, year: rawYear } = await params;
  const season = validateSeasonParam(rawSeason);
  const year = validateYearParam(rawYear);

  if (!season || year === null) {
    return createMetadata({
      title: "Seasonal Anime",
      description:
        "Browse seasonal anime lists, rankings, posters, ratings, and anime detail pages.",
      path: "/",
      noIndex: true,
    });
  }

  const title = formatSeasonTitle(season, year);

  return createMetadata({
    title: `${title} Anime`,
    description: `Browse ${title} anime with ratings, posters, genres, episode counts, studios, and links to detailed anime pages.`,
    path: `/seasons/${season}/${year}`,
    keywords: [
      `${season} ${year} anime`,
      `${title} anime`,
      "seasonal anime",
      "anime season list",
      "anime tracker",
    ],
  });
}

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
  const path = `/seasons/${season}/${year}`;
  const itemListJsonLd = createSeasonItemListJsonLd({
    name: `${title} Anime`,
    path,
    items: initialItems,
    detailHrefPrefix: path,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(itemListJsonLd) }}
      />
      <SeasonListClient
        title={title}
        initialItems={initialItems}
        detailHrefPrefix={path}
        season={season}
        year={year}
      />
    </>
  );
}
