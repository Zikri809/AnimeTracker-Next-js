import type { Metadata } from "next";
import HomeClient from "./_components/HomeClient";
import { fetchHomePageData } from "@/server/seasonal/home-page-data";

export const revalidate = 43200;

export const metadata: Metadata = {
  title: "AniJikan",
  description: "Explore trending and currently airing anime with AnimeTracker. Track your watchlist, manage your progress, and stay updated with the latest anime releases.",
  keywords: ["anime tracker", "anime discovery", "anime watchlist", "track anime episodes", "anime list manager", "trending anime", "currently airing anime"],
  openGraph: {
    title: "AnimeTracker - Discover & Track Your Favorite Anime",
    description: "A simple and clean platform to discover anime and manage your anime watchlist. Stay on top of trending and new anime releases.",
    url: "https://anime-tracker-next-js.vercel.app/",
    type: "website",
  },
};

export default async function Page() {
  const data = await fetchHomePageData();
  return <HomeClient {...data} />;
}
