import { redirect } from "next/navigation";
import {
  parseDetailRouteContext,
  buildPathnameFromParams,
  DetailRouteFamily,
  buildRetryLimitHref,
} from "@/lib/routing/detail-route-context";
import { fetchPublicAnimeDetail } from "@/server/mal/anime";
import { normalizeMalDetail } from "@/server/mal/anime-detail-normalize";
import AnimeDetailClient from "./AnimeDetailClient";
import { SITE_NAME, absoluteUrl, truncateDescription } from "@/lib/seo";
import {
  createAnimeBreadcrumbJsonLd,
  stringifyJsonLd,
} from "@/lib/structured-data";

type Props = {
  params: Promise<any> | any;
  family: DetailRouteFamily;
};

export default async function AnimeDetailPage({ params, family }: Props) {
  const resolvedParams = await params;
  let pathname = "";
  try {
    pathname = buildPathnameFromParams(family, resolvedParams, false);
  } catch (err) {
    redirect("/notFound");
  }

  let context;
  try {
    context = parseDetailRouteContext(pathname);
  } catch (err) {
    redirect("/notFound");
  }

  let rawDetail;
  try {
    rawDetail = await fetchPublicAnimeDetail(context.targetAnimeId);
  } catch (err) {
    console.error(
      `[anime-detail] MAL fetch failed for ${pathname} (anime ${context.targetAnimeId}):`,
      err instanceof Error ? err.message : err,
    );
    const query = {
      mal_id: String(context.sourceAnimeId),
      ...(context.relationAnimeId
        ? { relation_id: String(context.relationAnimeId) }
        : {}),
      ...(context.title ? { title: context.title } : {}),
      ...(context.mylistTab ? { mylist_tab: context.mylistTab } : {}),
      ...(context.season ? { season: context.season } : {}),
      ...(context.year ? { year: String(context.year) } : {}),
    };
    const redirectUrl = buildRetryLimitHref(pathname, query);
    redirect(redirectUrl);
  }

  const normalizedDetail = normalizeMalDetail(rawDetail);
  const animeJsonLd = {
    "@context": "https://schema.org",
    "@type": normalizedDetail.episodes === 1 ? "Movie" : "TVSeries",
    name: normalizedDetail.displayTitle,
    alternateName: normalizedDetail.englishTitle || undefined,
    url: absoluteUrl(`/Anime/${normalizedDetail.malId}`),
    image: normalizedDetail.imageUrl || undefined,
    description: truncateDescription(normalizedDetail.synopsis),
    genre: normalizedDetail.genres.map((genre) => genre.name).filter(Boolean),
    numberOfEpisodes: normalizedDetail.episodes || undefined,
    aggregateRating: normalizedDetail.score
      ? {
          "@type": "AggregateRating",
          ratingValue: normalizedDetail.score,
          ratingCount: normalizedDetail.scoredBy || undefined,
          bestRating: 10,
          worstRating: 1,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    sameAs: `https://myanimelist.net/anime/${normalizedDetail.malId}`,
  };
  const breadcrumbJsonLd = createAnimeBreadcrumbJsonLd({
    title: normalizedDetail.displayTitle,
    malId: normalizedDetail.malId,
  });
  const detailJsonLd = [animeJsonLd, breadcrumbJsonLd];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(detailJsonLd) }}
      />
      <AnimeDetailClient detail={normalizedDetail} context={context} />
    </>
  );
}
