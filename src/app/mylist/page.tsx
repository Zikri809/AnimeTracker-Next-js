import MyListClient from "./_components/MyListClient";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Anime Watchlist Tracker",
  description:
    "Manage, sort, search, and synchronize your anime watchlists across devices with AniJikan.",
  path: "/mylist",
  keywords: [
    "anime watchlist tracker",
    "anime list manager",
    "track anime episodes",
    "anime tracker",
  ],
  noIndex: true,
});

export default function MyListPage() {
  return <MyListClient />;
}
