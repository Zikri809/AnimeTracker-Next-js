import TrackingPage from '@/app/_components/anime-detail/TrackingPage';

type Params = Promise<{ season: string; year: string; mal_id: string }>;

type Props = {
  params: Params;
};

export default function Page({ params }: Props) {
  return <TrackingPage params={params} family="seasons" />;
}
