export const ANIME_SEASONS = ["winter", "spring", "summer", "fall"] as const;
export type AnimeSeason = typeof ANIME_SEASONS[number];

export type SeasonWindow = {
  current_month: number;
  current_year: number;
  current_season: AnimeSeason;
  past_year: number;
  past_season: AnimeSeason;
  upcoming_year: number;
  upcoming_season: AnimeSeason;
};

export function getSeasonWindow(now?: Date): SeasonWindow {
  const dateobject = now || new Date();
  if (isNaN(dateobject.getTime())) {
    throw new Error("Invalid Date input");
  }
  const current_month = dateobject.getMonth() + 1;
  const current_year = dateobject.getFullYear();

  let current_season: AnimeSeason;
  if (current_month >= 1 && current_month <= 3) {
    current_season = "winter";
  } else if (current_month >= 4 && current_month <= 6) {
    current_season = "spring";
  } else if (current_month >= 7 && current_month <= 9) {
    current_season = "summer";
  } else {
    current_season = "fall";
  }

  const currentIdx = ANIME_SEASONS.indexOf(current_season);

  // Past season calculation
  let past_season: AnimeSeason;
  let past_year: number;
  if (currentIdx === 0) {
    past_season = "fall";
    past_year = current_year - 1;
  } else {
    past_season = ANIME_SEASONS[currentIdx - 1];
    past_year = current_year;
  }

  // Upcoming season calculation
  let upcoming_season: AnimeSeason;
  let upcoming_year: number;
  if (currentIdx === ANIME_SEASONS.length - 1) {
    upcoming_season = "winter";
    upcoming_year = current_year + 1;
  } else {
    upcoming_season = ANIME_SEASONS[currentIdx + 1];
    upcoming_year = current_year;
  }

  return {
    current_month,
    current_year,
    current_season,
    past_year,
    past_season,
    upcoming_year,
    upcoming_season,
  };
}

export function getSeasonCarouselWindow(now?: Date): Array<{ season: AnimeSeason; year: number }> {
  const seasonWindow = getSeasonWindow(now);
  const currentIdx = ANIME_SEASONS.indexOf(seasonWindow.current_season);
  const currentVal = seasonWindow.current_year * 4 + currentIdx;

  const result: Array<{ season: AnimeSeason; year: number }> = [];
  // The carousel has 9 seasons: current_val - 6 to current_val + 2 inclusive
  for (let offset = -6; offset <= 2; offset++) {
    const val = currentVal + offset;
    const year = Math.floor(val / 4);
    const seasonIdx = ((val % 4) + 4) % 4; // handle negative remainder correctly
    result.push({
      season: ANIME_SEASONS[seasonIdx],
      year,
    });
  }

  return result;
}

export function generateSeasonStaticParams(now?: Date): Array<{ season: AnimeSeason; year: string }> {
  const carousel = getSeasonCarouselWindow(now);
  return carousel.map((item) => ({
    season: item.season,
    year: item.year.toString(),
  }));
}

export function validateSeasonParam(seasonStr?: string): AnimeSeason | null {
  if (!seasonStr) return null;
  const lower = seasonStr.trim().toLowerCase();
  if (ANIME_SEASONS.includes(lower as AnimeSeason)) {
    return lower as AnimeSeason;
  }
  return null;
}

export function validateYearParam(yearStr?: string): number | null {
  if (!yearStr) return null;
  const trimmed = yearStr.trim();
  if (!/^\d{4}$/.test(trimmed)) {
    return null;
  }
  const parsed = parseInt(trimmed, 10);
  if (isNaN(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export function formatSeasonTitle(season: string, year: number | string): string {
  const capSeason = season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
  return `${capSeason}, ${year}`;
}
