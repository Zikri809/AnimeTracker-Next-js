"use client";

import { createContext, useMemo, useContext } from "react";
import type { ReactNode } from "react";

import type { AnimeSeason, SeasonContextValue } from "@/types";

export const Season_context = createContext<SeasonContextValue | undefined>(undefined);

export function getSeasonContextValue(now = new Date()): SeasonContextValue {
  // Validate date is valid
  if (isNaN(now.getTime())) {
    throw new Error("Invalid date provided to getSeasonContextValue");
  }

  const current_month = now.getMonth() + 1;
  const current_year = now.getFullYear();
  const seasons: AnimeSeason[] = ["winter", "spring", "summer", "fall"];

  let current_season: AnimeSeason;
  if (current_month >= 1 && current_month <= 3) {
    current_season = seasons[0];
  } else if (current_month >= 4 && current_month <= 6) {
    current_season = seasons[1];
  } else if (current_month >= 7 && current_month <= 9) {
    current_season = seasons[2];
  } else {
    current_season = seasons[3];
  }

  const currentIdx = seasons.indexOf(current_season);

  let past_season: AnimeSeason;
  let past_year: number;
  if (currentIdx === 0) {
    past_season = seasons[seasons.length - 1];
    past_year = current_year - 1;
  } else {
    past_season = seasons[currentIdx - 1];
    past_year = current_year;
  }

  let upcoming_season: AnimeSeason;
  let upcoming_year: number;
  if (currentIdx === seasons.length - 1) {
    upcoming_season = seasons[0];
    upcoming_year = current_year + 1;
  } else {
    upcoming_season = seasons[currentIdx + 1];
    upcoming_year = current_year;
  }

  return {
    current_month,
    current_year,
    current_season,
    past_season,
    past_year,
    upcoming_season,
    upcoming_year,
  };
}

export function useSeasonContext(): SeasonContextValue {
  const context = useContext(Season_context);
  if (context === undefined) {
    throw new Error("useSeasonContext must be used within a SeasonProvider");
  }
  return context;
}

export function SeasonProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => getSeasonContextValue(), []);
  return <Season_context.Provider value={value}>{children}</Season_context.Provider>;
}
