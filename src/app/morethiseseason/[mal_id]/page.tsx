import AnimeDetailPage from '@/app/_components/anime-detail/AnimeDetailPage';

type Params = Promise<{ mal_id: string }>;

type Props = {
  params: Params;
};

export default function Page({ params }: Props) {
  return <AnimeDetailPage params={params} family="morethiseseason" />;
}
