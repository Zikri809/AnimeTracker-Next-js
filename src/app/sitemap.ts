import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import {
  generateSeasonStaticParams,
  getSeasonWindow,
} from "@/server/seasonal/page-season";
import { fetchJikanSeasonCards } from "@/server/seasonal/home-page-data";

const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/search/NA", priority: 0.7, changeFrequency: "weekly" },
  { path: "/morethiseseason", priority: 0.9, changeFrequency: "daily" },
  { path: "/morelastseason", priority: 0.75, changeFrequency: "weekly" },
  { path: "/moreupcoming", priority: 0.8, changeFrequency: "daily" },
  { path: "/mylist", priority: 0.45, changeFrequency: "monthly" },
];

async function getSeasonalAnimePaths() {
  const window = getSeasonWindow();
  const seasonInputs = [
    { season: window.current_season, year: window.current_year },
    { season: window.past_season, year: window.past_year },
    { season: window.upcoming_season, year: window.upcoming_year },
  ];

  const results = await Promise.allSettled(
    seasonInputs.map((input) =>
      fetchJikanSeasonCards(input.season, input.year),
    ),
  );

  const ids = new Set<number>();
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const item of result.value.querydata) {
      ids.add(item.mal_id);
    }
  }

  return Array.from(ids).map((id) => `/Anime/${id}`);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const seasonRoutes = generateSeasonStaticParams().map(
    ({ season, year }) => `/seasons/${season}/${year}`,
  );
  const animeRoutes = await getSeasonalAnimePaths();

  return [
    ...STATIC_ROUTES,
    ...seasonRoutes.map((path) => ({
      path,
      priority: 0.8,
      changeFrequency: "weekly" as const,
    })),
    ...animeRoutes.map((path) => ({
      path,
      priority: 0.7,
      changeFrequency: "weekly" as const,
    })),
  ].map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }));
}
