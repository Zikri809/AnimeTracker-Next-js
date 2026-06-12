import { createMetadata, truncateDescription } from "@/lib/seo";
import { fetchJikanDetailRaw } from "@/server/anime/jikan-detail";
import { normalizeJikanDetail } from "@/server/anime/jikan-detail-normalize";
import {
  DetailRouteFamily,
  buildPathnameFromParams,
  parseDetailRouteContext,
} from "@/lib/routing/detail-route-context";

type AnimeMetadataInput = {
  params: Promise<any> | any;
  family: DetailRouteFamily;
  isTracking?: boolean;
};

export async function generateAnimeDetailMetadata({
  params,
  family,
  isTracking = false,
}: AnimeMetadataInput) {
  try {
    const resolvedParams = await params;
    const pathname = buildPathnameFromParams(
      family,
      resolvedParams,
      isTracking,
    );
    const context = parseDetailRouteContext(pathname);

    if (isTracking) {
      return createMetadata({
        title: "Track Anime",
        description:
          "Update watch status, episode progress, and score for an anime in your watchlist.",
        path: `/Anime/${context.targetAnimeId}`,
        noIndex: true,
      });
    }

    const rawDetail = await fetchJikanDetailRaw(context.targetAnimeId);
    const detail = normalizeJikanDetail(rawDetail);
    const canonicalPath = `/Anime/${context.targetAnimeId}`;
    const title = [detail.displayTitle, "Anime"].filter(Boolean).join(" ");
    const genres = detail.genres.map((genre) => genre.name).filter(Boolean);

    return createMetadata({
      title,
      description: truncateDescription(
        detail.synopsis,
        `View ${detail.displayTitle} anime details, rating, genres, episodes, trailer, studios, related anime, and watchlist tracking.`,
      ),
      path: canonicalPath,
      image: detail.imageUrl,
      keywords: [
        `${detail.displayTitle} anime`,
        `${detail.displayTitle} watchlist`,
        `${detail.displayTitle} episodes`,
        ...genres,
        "anime details",
        "anime tracker",
      ],
      type: "article",
    });
  } catch {
    return createMetadata({
      title: "Anime Details",
      description:
        "View anime details, ratings, episode counts, trailers, related anime, and watchlist tracking.",
      path: "/",
      noIndex: true,
    });
  }
}
