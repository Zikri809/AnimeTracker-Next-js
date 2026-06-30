import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import {
  generateSeasonStaticParams,
} from "@/server/seasonal/page-season";

export const revalidate = 86400;

const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/morethiseseason", priority: 0.9, changeFrequency: "weekly" },
  { path: "/morelastseason", priority: 0.75, changeFrequency: "weekly" },
  { path: "/moreupcoming", priority: 0.8, changeFrequency: "weekly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const seasonRoutes = generateSeasonStaticParams().map(
    ({ season, year }) => `/seasons/${season}/${year}`,
  );

  return [
    ...STATIC_ROUTES,
    ...seasonRoutes.map((path) => ({
      path,
      priority: 0.8,
      changeFrequency: "weekly" as const,
    })),
  ].map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    changeFrequency,
    priority,
  }));
}
