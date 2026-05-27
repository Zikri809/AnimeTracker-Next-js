export interface AnimeImage {
  large_image_url: string;
  image_url?: string;
  small_image_url?: string;
}

export interface AnimeImages {
  webp: AnimeImage;
  jpg?: AnimeImage;
}

export interface AnimeBasicInfo {
  mal_id: number;
  id?: number;
  title: string;
  title_english: string | null;
  images: AnimeImages;
  year?: number;
  score?: number;
  status?: string;
}

export interface SeasonSectionProps {
  data?: AnimeBasicInfo[];
  loading?: boolean;
  error?: boolean;
  className?: string;
}
