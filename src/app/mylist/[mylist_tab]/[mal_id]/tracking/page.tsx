import TrackingPage from '@/app/_components/anime-detail/TrackingPage';

type Params = Promise<{ mylist_tab: string; mal_id: string }>;

type Props = {
  params: Params;
};

export default function Page({ params }: Props) {
  return <TrackingPage params={params} family="mylist" />;
}
