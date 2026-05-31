import { cookies } from 'next/headers';
import { COOKIES } from '@/server/http/cookies';
import { redirect } from 'next/navigation';
import { parseDetailRouteContext, buildPathnameFromParams, DetailRouteFamily, buildRetryLimitHref } from '@/lib/routing/detail-route-context';
import { checkAnimeAppearsInMalSearch, fetchPublicAnimeForTracking, isPotentiallyRestrictedAnime } from '@/server/mal/anime';
import { normalizeMalAnime } from '@/server/mal/anime-normalize';
import TrackingClient from './TrackingClient';

type Props = {
  params: Promise<any> | any;
  family: DetailRouteFamily;
};

export default async function TrackingPage({ params, family }: Props) {
  const resolvedParams = await params;
  let pathname = '';
  try {
    pathname = buildPathnameFromParams(family, resolvedParams, true);
  } catch (err) {
    redirect('/notFound');
  }

  let context;
  try {
    context = parseDetailRouteContext(pathname);
  } catch (err) {
    redirect('/notFound');
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIES.ACCESS_TOKEN)?.value;

  let rawMalDetail;
  try {
    rawMalDetail = await fetchPublicAnimeForTracking(context.targetAnimeId, accessToken);
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

  const normalizedMalDetail = normalizeMalAnime(rawMalDetail);
  const titleForSearch = rawMalDetail?.alternative_titles?.en || rawMalDetail?.title;
  const malSearchVisible = isPotentiallyRestrictedAnime(rawMalDetail)
    ? await checkAnimeAppearsInMalSearch(context.targetAnimeId, titleForSearch)
    : true;

  return <TrackingClient malDetail={normalizedMalDetail} context={context} malSearchVisible={malSearchVisible} />;
}
