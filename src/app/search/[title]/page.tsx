import SearchPageClient from "./SearchPageClient";
import { createMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ title: string }>;
};

function decodeSearchTitle(title: string) {
  try {
    return decodeURIComponent(title);
  } catch {
    return title;
  }
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const decodedTitle = decodeSearchTitle(resolvedParams.title);
  const isDefaultSearch = decodedTitle.toUpperCase() === "NA";

  return createMetadata({
    title: isDefaultSearch
      ? "Search Anime"
      : `Search Anime for ${decodedTitle}`,
    description: isDefaultSearch
      ? "Search for anime titles and open detailed anime pages with ratings, trailers, genres, studios, and watchlist tracking."
      : `Search results for ${decodedTitle}. Find anime ratings, posters, genres, studios, trailers, and watchlist tracking.`,
    path: `/search/${encodeURIComponent(decodedTitle)}`,
    keywords: [
      `${decodedTitle} anime`,
      "anime search",
      "anime tracker",
      "anime watchlist",
      "anime details",
    ],
  });
}

export default async function SearchTitlePage({ params }: Props) {
  const resolvedParams = await params;
  const decodedTitle = decodeSearchTitle(resolvedParams.title);

  return <SearchPageClient title={decodedTitle} />;
}
