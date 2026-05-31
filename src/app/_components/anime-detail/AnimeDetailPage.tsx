import { redirect } from 'next/navigation';
import { parseDetailRouteContext, buildPathnameFromParams, DetailRouteFamily, buildRetryLimitHref } from '@/lib/routing/detail-route-context';
import { fetchJikanDetailRaw, fetchJikanRelations } from '@/server/anime/jikan-detail';
import { normalizeJikanDetail } from '@/server/anime/jikan-detail-normalize';
import AnimeDetailClient from './AnimeDetailClient';

type Props = {
  params: Promise<any> | any;
  family: DetailRouteFamily;
};

export default async function AnimeDetailPage({ params, family }: Props) {
  const resolvedParams = await params;
  let pathname = '';
  try {
    pathname = buildPathnameFromParams(family, resolvedParams, false);
  } catch (err) {
    redirect('/notFound');
  }

  let context;
  try {
    context = parseDetailRouteContext(pathname);
  } catch (err) {
    redirect('/notFound');
  }

  let rawDetail;
  try {
    rawDetail = await fetchJikanDetailRaw(context.targetAnimeId);
  } catch (err) {
    const query = {
      mal_id: String(context.sourceAnimeId),
      ...(context.relationAnimeId ? { relation_id: String(context.relationAnimeId) } : {}),
      ...(context.title ? { title: context.title } : {}),
      ...(context.mylistTab ? { mylist_tab: context.mylistTab } : {}),
      ...(context.season ? { season: context.season } : {}),
      ...(context.year ? { year: String(context.year) } : {}),
    };
    const redirectUrl = buildRetryLimitHref(pathname, query);
    redirect(redirectUrl);
  }

  let rawRelations;
  try {
    rawRelations = await fetchJikanRelations(context.targetAnimeId, rawDetail);
  } catch {
    rawRelations = [];
  }

  const normalizedDetail = normalizeJikanDetail(rawDetail, rawRelations);

  return <AnimeDetailClient detail={normalizedDetail} context={context} />;
}
