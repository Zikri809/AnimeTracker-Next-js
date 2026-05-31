export type AnimeSeason = "winter" | "spring" | "summer" | "fall";

export interface SeasonContextValue {
  current_month: number;
  current_year: number;
  current_season: AnimeSeason;
  past_season: AnimeSeason;
  past_year: number;
  upcoming_season: AnimeSeason;
  upcoming_year: number;
}
