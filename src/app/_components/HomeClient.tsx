"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/ComponentsSelf/navbar";
import LastSeason from "@/ComponentsSelf/LastSeason";
import { CarouselDemo } from "@/ComponentsSelf/carousel";
import ThisSeasonSec from "@/ComponentsSelf/ThisSeasonSec";
import UpcomingSec from "@/ComponentsSelf/Upcoming";
import Season_carousel from "@/ComponentsSelf/carousel/season_carousel";
import { fetchAuthSession, isSessionExpiringSoon } from "@/lib/auth-session";
import tokenrefresh from "@/Utility/refreshjob";
import type {
  HomeSeasonResult,
  AniListSpotlightItem,
  HomeSeasonCarouselData,
} from "@/server/seasonal/home-page-data";

interface HomeClientProps {
  thisseason: HomeSeasonResult;
  pastSeason: HomeSeasonResult;
  upcomingSeason: HomeSeasonResult;
  carouseldata: {
    querydata: AniListSpotlightItem[];
    isloading: boolean;
    error: boolean;
  };
  seasonal_carousel_data: HomeSeasonCarouselData;
}

export default function HomeClient({
  thisseason,
  pastSeason,
  upcomingSeason,
  carouseldata,
  seasonal_carousel_data,
}: HomeClientProps) {
  const router = useRouter();

  // Auth Session token refresh
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await fetchAuthSession();
        if (!session.hasRefreshToken || !isSessionExpiringSoon(session)) return;
        console.log("refresh token get");
        const result = await tokenrefresh();
        if (result.status !== 200) {
          console.log("token refresh failed, purging the localStorage");
          localStorage.setItem("Watching", JSON.stringify([]));
          localStorage.setItem("Completed", JSON.stringify([]));
          localStorage.setItem("OnHold", JSON.stringify([]));
          localStorage.setItem("Dropped", JSON.stringify([]));
          localStorage.setItem("PlanToWatch", JSON.stringify([]));
        }
        window.location.reload();
      } catch (error) {
        console.error("Error during session check:", error);
      }
    };
    checkSession();
  }, []);

  // Local/session storage initialization
  useEffect(() => {
    // Initialize session storage keys safely
    try {
      sessionStorage.setItem("morescroll", JSON.stringify(0));
      sessionStorage.removeItem("animedatasearch");
      sessionStorage.removeItem("lastupdatetimesearch");
      sessionStorage.setItem("activetab", "Plan To Watch");
      sessionStorage.setItem("scrollY", "0");
      sessionStorage.setItem("slicearr", JSON.stringify(30));
    } catch (e) {
      console.error("Failed to write to sessionStorage:", e);
    }

    // Initialize localStorage watchlist maps if not present safely
    const initWatchlistKey = (key: string) => {
      try {
        if (localStorage.getItem(key) === null) {
          localStorage.setItem(key, JSON.stringify([]));
        }
      } catch (e) {
        console.error(`Failed to initialize localStorage key ${key}:`, e);
      }
    };

    initWatchlistKey("Watching");
    initWatchlistKey("Completed");
    initWatchlistKey("PlanToWatch");
    initWatchlistKey("OnHold");
    initWatchlistKey("Dropped");
  }, []);

  return (
    <main className="app-shell pb-28 sm:pb-8">
      <Nav />

      <div className="flex flex-col pt-20">
        <CarouselDemo data={carouseldata.querydata} />
        <ThisSeasonSec
          data={thisseason.querydata}
          loading={thisseason.isloading}
          error={thisseason.error}
        />
        <LastSeason
          className=""
          data={pastSeason.querydata}
          loading={pastSeason.isloading}
          error={pastSeason.error}
        />
        <UpcomingSec
          data={upcomingSeason.querydata}
          loading={upcomingSeason.isloading}
          error={upcomingSeason.error}
        />
        <Season_carousel data={seasonal_carousel_data} />
      </div>
    </main>
  );
}
