export type JikanAnimeDetailViewModel = {
  malId: number;
  title: string;
  englishTitle: string | null;
  displayTitle: string;
  imageUrl: string | null;
  bannerImageUrl: string | null;
  status: string | null;
  statusLabel: string;
  seasonLabel: string | null;
  episodes: number | null;
  score: number | null;
  scoredBy: number | null;
  rank: number | null;
  popularity: number | null;
  favorites: number | null;
  genres: Array<{ id: number | null; name: string }>;
  synopsis: string | null;
  source: string | null;
  studios: string[];
  rating: string | null;
  airedLabel: string | null;
  broadcast: { day?: string | null; time?: string | null; timezone?: string | null; label?: string | null } | null;
  trailerEmbedUrl: string | null;
  licensors: string[];
  duration: string | null;
  relations: Array<{
    relation: string;
    entries: Array<{ malId: number; name: string; type?: string | null }>;
  }>;
};

function isValidRelationId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function normalizeTrailerEmbedUrl(rawTrailerEmbed: unknown): string | null {
  if (typeof rawTrailerEmbed !== 'string' || rawTrailerEmbed.trim() === '') return null;

  try {
    const url = new URL(rawTrailerEmbed);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    url.searchParams.set('autoplay', '0');
    url.searchParams.set('mute', '0');
    return url.toString();
  } catch {
    if (!rawTrailerEmbed.startsWith('https://') && !rawTrailerEmbed.startsWith('http://')) {
      return null;
    }
    if (rawTrailerEmbed.includes('?')) {
      let clean = rawTrailerEmbed.replace(/autoplay=[^&]+/, 'autoplay=0');
      if (!clean.includes('autoplay=')) {
        clean += '&autoplay=0';
      }
      if (!clean.includes('mute=')) {
        clean += '&mute=0';
      }
      return clean;
    }
    return `${rawTrailerEmbed}?autoplay=0&mute=0`;
  }
}

export function normalizeJikanDetail(data: any, relationsData?: any[], bannerImageUrl: string | null = null): JikanAnimeDetailViewModel {
  const malId = data.mal_id;
  const title = data.title || '';
  const englishTitle = data.title_english || null;
  const displayTitle = englishTitle || title || `Anime #${malId}`;

  let imageUrl: string | null = null;
  if (data.images?.webp?.large_image_url) {
    imageUrl = data.images.webp.large_image_url;
  } else if (data.images?.jpg?.large_image_url) {
    imageUrl = data.images.jpg.large_image_url;
  } else if (data.images?.webp?.image_url) {
    imageUrl = data.images.webp.image_url;
  } else if (data.images?.jpg?.image_url) {
    imageUrl = data.images.jpg.image_url;
  }

  const status = data.status || null;
  const statusLabel = status || 'Unknown';

  let seasonLabel: string | null = null;
  if (data.season) {
    const capitalizedSeason = data.season.charAt(0).toUpperCase() + data.season.slice(1);
    seasonLabel = data.year ? `${capitalizedSeason} ${data.year}` : capitalizedSeason;
  }

  const episodes = typeof data.episodes === 'number' ? data.episodes : null;
  const score = typeof data.score === 'number' ? data.score : null;
  const scoredBy = typeof data.scored_by === 'number' ? data.scored_by : null;
  const rank = typeof data.rank === 'number' ? data.rank : null;
  const popularity = typeof data.popularity === 'number' ? data.popularity : null;
  const favorites = typeof data.favorites === 'number' ? data.favorites : null;

  const genres = Array.isArray(data.genres)
    ? data.genres.map((g: any) => ({
        id: typeof g.mal_id === 'number' ? g.mal_id : null,
        name: g.name || '',
      }))
    : [];

  const synopsis = data.synopsis || null;
  const source = data.source || null;

  const studios = Array.isArray(data.studios)
    ? data.studios.map((s: any) => s.name || '').filter(Boolean)
    : [];

  const rating = data.rating || null;
  const airedLabel = data.aired?.string || null;

  let broadcast: JikanAnimeDetailViewModel['broadcast'] = null;
  if (data.broadcast && (data.broadcast.day || data.broadcast.time || data.broadcast.timezone || data.broadcast.string)) {
    broadcast = {
      day: data.broadcast.day || null,
      time: data.broadcast.time || null,
      timezone: data.broadcast.timezone || null,
      label: data.broadcast.string || null,
    };
  }

  const trailerEmbedUrl = normalizeTrailerEmbedUrl(data.trailer?.embed_url);

  const licensors = Array.isArray(data.licensors)
    ? data.licensors.map((l: any) => l.name || '').filter(Boolean)
    : [];

  const duration = data.duration || null;

  const rawRelations = relationsData || data.relations || [];
  const relations = Array.isArray(rawRelations)
    ? rawRelations.map((rel: any) => ({
        relation: rel.relation || '',
        entries: Array.isArray(rel.entry)
          ? rel.entry
              .filter((entry: any) => isValidRelationId(entry?.mal_id))
              .map((entry: any) => ({
                malId: entry.mal_id,
                name: entry.name || '',
                type: entry.type || null,
              }))
          : [],
      }))
    : [];

  return {
    malId,
    title,
    englishTitle,
    displayTitle,
    imageUrl,
    bannerImageUrl,
    status,
    statusLabel,
    seasonLabel,
    episodes,
    score,
    scoredBy,
    rank,
    popularity,
    favorites,
    genres,
    synopsis,
    source,
    studios,
    rating,
    airedLabel,
    broadcast,
    trailerEmbedUrl,
    licensors,
    duration,
    relations,
  };
}
