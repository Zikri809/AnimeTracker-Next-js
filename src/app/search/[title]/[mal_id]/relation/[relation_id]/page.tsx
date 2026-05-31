import AnimeDetailPage from "@/app/_components/anime-detail/AnimeDetailPage";
import { generateAnimeDetailMetadata } from "@/app/_components/anime-detail/metadata";

type Params = Promise<{ title: string; mal_id: string; relation_id: string }>;

type Props = {
  params: Params;
};

export function generateMetadata({ params }: Props) {
  return generateAnimeDetailMetadata({ params, family: "search" });
}

export default function Page({ params }: Props) {
  return <AnimeDetailPage params={params} family="search" />;
}
