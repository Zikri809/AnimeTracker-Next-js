import type { Metadata } from "next";
import HomeClient from "./_components/HomeClient";
import { fetchHomePageData } from "@/server/seasonal/home-page-data";
import { SITE_NAME, createMetadata } from "@/lib/seo";

export const revalidate = 43200;

export const metadata: Metadata = {
  ...createMetadata({
    title: `${SITE_NAME} - Anime Tracker for Seasonal Anime, Watchlists, and Discovery`,
    description:
      "Discover trending anime, browse current and upcoming seasons, and track your anime watchlist with AniJikan.",
    path: "/",
  }),
};

export default async function Page() {
  const data = await fetchHomePageData();
  return <HomeClient {...data} />;
}
