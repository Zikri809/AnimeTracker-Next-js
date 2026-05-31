import TrackingPage from "@/app/_components/anime-detail/TrackingPage";
import { generateAnimeDetailMetadata } from "@/app/_components/anime-detail/metadata";

type Params = Promise<{ mal_id: string; relation_id: string }>;

type Props = {
  params: Params;
};

export function generateMetadata({ params }: Props) {
  return generateAnimeDetailMetadata({
    params,
    family: "morelastseason",
    isTracking: true,
  });
}

export default function Page({ params }: Props) {
  return <TrackingPage params={params} family="morelastseason" />;
}
