"use client";

import { useEffect, useRef } from "react";
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
  const navsearchref = useRef<HTMLInputElement>(null);
  const navbuttonref = useRef<HTMLButtonElement>(null);
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

  // Search logic and localStorage initialization
  useEffect(() => {
    const navsearchbar = navsearchref.current;
    const navbutton = navbuttonref.current;

    if (!navsearchbar || !navbutton) return;

    const enterhandler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        searchhandler();
      }
    };

    const searchhandler = () => {
      if (navsearchbar.value !== "") {
        const sanitized = navsearchbar.value.replace(/[\/\\<>'"&]/g, "");
        router.push(
          navsearchbar.value.length === 0
            ? "/"
            : `/search/${encodeURIComponent(sanitized)}`
        );
      } else {
        router.push("/search");
      }
    };

    navbutton.addEventListener("click", searchhandler);
    window.addEventListener("keydown", enterhandler);

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

    return () => {
      navbutton.removeEventListener("click", searchhandler);
      window.removeEventListener("keydown", enterhandler);
    };
  }, [router]);

  return (
    <main className="relative top-0 left-0 overflow-x-clip m-0 w-[100%] h-fit pb-13 bg-black text-white font-poppins my-1">
      <Nav searchref={navsearchref} buttonref={navbuttonref} />

      <div className="flex flex-col pt-18">
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
