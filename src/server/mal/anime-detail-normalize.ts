export type AnimeDetailViewModel = {
  malId: number;
  title: string;
  englishTitle: string | null;
  displayTitle: string;
  imageUrl: string | null;
  bannerImageUrl: string | null;
  status: string | null;
  statusLabel: string;
  season: string | null;
  year: number | null;
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
  broadcast: {
    day?: string | null;
    time?: string | null;
    timezone?: string | null;
    label?: string | null;
  } | null;
  trailerEmbedUrl: string | null;
  licensors: string[];
  duration: string | null;
  relations: Array<{
    relation: string;
    entries: Array<{ malId: number; name: string; type?: string | null }>;
  }>;
};

// MAL uses snake_case status enums; the UI (statusClassName in
// animecardheader.tsx) matches the human-readable strings.
const MAL_STATUS_TO_DISPLAY: Record<string, string> = {
  finished_airing: "Finished Airing",
  currently_airing: "Currently Airing",
  not_yet_aired: "Not Yet Aired",
};

function mapMalStatus(raw: unknown): string | null {
  if (typeof raw !== "string" || raw === "") return null;
  return MAL_STATUS_TO_DISPLAY[raw] ?? raw;
}

const MAL_RATING_TO_DISPLAY: Record<string, string> = {
  g: "G - All Ages",
  pg: "PG - Children",
  pg_13: "PG-13 - Teens 13 or older",
  r_17: "R - 17+ (violence & profanity)",
  rx: "Rx - Hentai",
};

function mapMalRating(raw: unknown): string | null {
  if (typeof raw !== "string" || raw === "") return null;
  return MAL_RATING_TO_DISPLAY[raw] ?? raw;
}

function mapMalSource(raw: unknown): string | null {
  if (typeof raw !== "string" || raw === "") return null;
  const words = raw.replace(/_/g, " ").split(" ");
  return words
    .map((word, index) =>
      index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word,
    )
    .join(" ");
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Parse "1998-04-03" manually instead of via Date so UTC-anchored ISO strings
// never shift a day for viewers in negative UTC offsets.
function formatMalDate(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match;
  const monthIndex = Number(month) - 1;
  if (monthIndex < 0 || monthIndex >= MONTH_NAMES.length) return null;
  const dayNum = Number(day);
  if (dayNum < 1 || dayNum > 31) return null;
  return `${MONTH_NAMES[monthIndex]} ${dayNum}, ${year}`;
}

function buildAiredLabel(startDate: unknown, endDate: unknown): string | null {
  const start = formatMalDate(startDate);
  const end = formatMalDate(endDate);
  if (start && end) return `${start} to ${end}`;
  return start || end;
}

function formatDuration(seconds: unknown): string | null {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

// MAL broadcast times are always JST.
function mapMalBroadcast(rawBroadcast: any): AnimeDetailViewModel["broadcast"] {
  if (
    !rawBroadcast ||
    (typeof rawBroadcast === "object" &&
      !rawBroadcast.day_of_week &&
      !rawBroadcast.start_time)
  ) {
    return null;
  }

  const dayIndex = WEEKDAYS.findIndex(
    (day) => day.toLowerCase() === rawBroadcast.day_of_week,
  );
  const day = dayIndex >= 0 ? WEEKDAYS[dayIndex] : null;
  const time =
    typeof rawBroadcast.start_time === "string" && rawBroadcast.start_time !== ""
      ? rawBroadcast.start_time
      : null;
  if (!day && !time) return null;

  return {
    day: day ? `${day}s` : null,
    time,
    timezone: "Asia/Tokyo",
    label: [day ? `${day}s` : null, time ? `at ${time} (JST)` : null]
      .filter(Boolean)
      .join(" "),
  };
}

// related_anime relations are snake_case enums ("side_story"); Jikan displayed
// title case ("Side Story"), which the UI continues to show.
function mapMalRelation(raw: unknown): string {
  if (typeof raw !== "string" || raw === "") return "";
  return raw
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isValidRelationId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function mapMalRelations(rawRelations: unknown): AnimeDetailViewModel["relations"] {
  if (!Array.isArray(rawRelations)) return [];
  return rawRelations.map((rel: any) => ({
    relation: mapMalRelation(rel?.relation),
    entries: Array.isArray(rel?.entry)
      ? rel.entry
          .filter((entry: any) => isValidRelationId(entry?.id))
          .map((entry: any) => ({
            malId: entry.id,
            name: entry.name || `Anime #${entry.id}`,
            type: entry.type || null,
          }))
      : [],
  }));
}

function normalizeTrailerEmbedUrl(rawTrailerEmbed: unknown): string | null {
  if (typeof rawTrailerEmbed !== "string" || rawTrailerEmbed.trim() === "")
    return null;

  try {
    const url = new URL(rawTrailerEmbed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    url.searchParams.set("autoplay", "0");
    url.searchParams.set("mute", "0");
    return url.toString();
  } catch {
    if (
      !rawTrailerEmbed.startsWith("https://") &&
      !rawTrailerEmbed.startsWith("http://")
    ) {
      return null;
    }
    if (rawTrailerEmbed.includes("?")) {
      let clean = rawTrailerEmbed.replace(/autoplay=[^&]+/, "autoplay=0");
      if (!clean.includes("autoplay=")) {
        clean += "&autoplay=0";
      }
      if (!clean.includes("mute=")) {
        clean += "&mute=0";
      }
      return clean;
    }
    return `${rawTrailerEmbed}?autoplay=0&mute=0`;
  }
}

type NormalizeExtras = {
  bannerImageUrl?: string | null;
  trailerEmbedUrl?: string | null;
};

export function normalizeMalDetail(
  data: any,
  extras: NormalizeExtras = {},
): AnimeDetailViewModel {
  const malId = data.id;
  const title = data.title || "";
  const englishTitle = data.alternative_titles?.en || null;
  const displayTitle = englishTitle || title || `Anime #${malId}`;

  const imageUrl =
    data.main_picture?.large || data.main_picture?.medium || null;

  const status = mapMalStatus(data.status);
  const statusLabel = status || "Unknown";

  const rawSeason =
    typeof data.start_season?.season === "string"
      ? data.start_season.season.trim().toLowerCase()
      : null;
  const season =
    rawSeason === "winter" ||
    rawSeason === "spring" ||
    rawSeason === "summer" ||
    rawSeason === "fall"
      ? rawSeason
      : null;
  const year =
    typeof data.start_season?.year === "number" &&
    Number.isInteger(data.start_season.year) &&
    data.start_season.year > 0
      ? data.start_season.year
      : null;

  let seasonLabel: string | null = null;
  if (season) {
    const capitalizedSeason = season.charAt(0).toUpperCase() + season.slice(1);
    seasonLabel = year ? `${capitalizedSeason} ${year}` : capitalizedSeason;
  }

  const episodes =
    typeof data.num_episodes === "number" ? data.num_episodes : null;
  const score = typeof data.mean === "number" ? data.mean : null;
  const scoredBy =
    typeof data.num_scoring_users === "number" ? data.num_scoring_users : null;
  const rank = typeof data.rank === "number" ? data.rank : null;
  const popularity =
    typeof data.popularity === "number" ? data.popularity : null;
  const favorites =
    typeof data.num_favorites === "number" ? data.num_favorites : null;

  const genres = Array.isArray(data.genres)
    ? data.genres.map((g: any) => ({
        id: typeof g.id === "number" ? g.id : null,
        name: g.name || "",
      }))
    : [];

  const studios = Array.isArray(data.studios)
    ? data.studios.map((s: any) => s.name || "").filter(Boolean)
    : [];

  const licensors = Array.isArray(data.licensors)
    ? data.licensors.map((l: any) => l.name || "").filter(Boolean)
    : [];

  return {
    malId,
    title,
    englishTitle,
    displayTitle,
    imageUrl,
    bannerImageUrl: extras.bannerImageUrl ?? null,
    status,
    statusLabel,
    season,
    year,
    seasonLabel,
    episodes,
    score,
    scoredBy,
    rank,
    popularity,
    favorites,
    genres,
    synopsis: data.synopsis || null,
    source: mapMalSource(data.source),
    studios,
    rating: mapMalRating(data.rating),
    airedLabel: buildAiredLabel(data.start_date, data.end_date),
    broadcast: mapMalBroadcast(data.broadcast),
    trailerEmbedUrl: normalizeTrailerEmbedUrl(extras.trailerEmbedUrl),
    licensors,
    duration: formatDuration(data.average_episode_duration),
    relations: mapMalRelations(data.related_anime),
  };
}
