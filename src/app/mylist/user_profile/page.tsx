"use client";

import User_card from "@/ComponentsSelf/user_profile/user_card";
import { fetchAuthSession } from "@/lib/auth-session";
import { useEffect, useState } from "react";
import User_profile_navbar from "@/ComponentsSelf/user_profile/user_profile_navbar";
import Stat_card from "@/ComponentsSelf/user_profile/anime_statcard";
import Top_rated from "@/ComponentsSelf/user_profile/Top_rated";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UserProfile() {
  const [userobject, Set_userobject] = useState<any>(null);
  const [joined_date, Set_joined_date] = useState<any>({
    year: "N/A",
    month: "N/A",
    day: "N/A",
  });
  const [loading, setloading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    function applyUserData(user_data: any) {
      Set_userobject(user_data);
      let dateformat = { year: "N/A", month: "N/A", day: "N/A" };
      if (user_data.joined_at) {
        const date = new Date(user_data.joined_at);
        if (!Number.isNaN(date.getTime())) {
          dateformat = {
            year: String(date.getFullYear()),
            month: String(date.getMonth() + 1),
            day: String(date.getDate()),
          };
        }
      }
      Set_joined_date(dateformat);
      setloading(false);
    }

    fetchAuthSession().then(async (session) => {
      if (cancelled) return;
      if (!session.authenticated) {
        setloading(false);
        return;
      }

      // Fetch dynamically from endpoint to guarantee fresh stats and bypass 4KB cookie size limits
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch("/api/users/data/user_data", {
          cache: "no-store",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (cancelled) return;
        if (res.ok) {
          const freshUserData = await res.json();
          const userData = freshUserData?.user_data ?? freshUserData;
          if (userData) {
            applyUserData(userData);
            return;
          }
        }
      } catch (e) {
        console.error(
          "Failed to fetch fresh user data, falling back to session cache:",
          e,
        );
      }

      // Fallback to session cache if direct API fails
      if (session.userData) {
        applyUserData(session.userData);
      } else {
        setloading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function numericStat(value: unknown) {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
  }

  const rawStats = userobject?.anime_statistics ?? {};
  const stats = {
    num_items_watching: numericStat(rawStats.num_items_watching),
    num_items_completed: numericStat(rawStats.num_items_completed),
    num_items_on_hold: numericStat(rawStats.num_items_on_hold),
    num_items_dropped: numericStat(rawStats.num_items_dropped),
    num_items_plan_to_watch: numericStat(rawStats.num_items_plan_to_watch),
    num_items: numericStat(rawStats.num_items),
    num_days_watched: numericStat(rawStats.num_days_watched),
    num_days_watching: numericStat(rawStats.num_days_watching),
    num_days_completed: numericStat(rawStats.num_days_completed),
    num_days_on_hold: numericStat(rawStats.num_days_on_hold),
    num_days_dropped: numericStat(rawStats.num_days_dropped),
    num_days: numericStat(rawStats.num_days),
    num_episodes: numericStat(rawStats.num_episodes),
    mean_score: numericStat(rawStats.mean_score),
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <User_profile_navbar />
      {loading ? (
        <div className="flex w-full h-[70svh] items-center justify-center relative top-20">
          <p className="text-neutral-400 text-lg">Loading Profile...</p>
        </div>
      ) : userobject ? (
        <div className="flex flex-col gap-4 mx-4 max-w-[calc(100%-2rem)] min-h-[calc(100vh-5rem)] pb-20 relative top-20">
          <div className="flex-col flex gap-4 w-full">
            <User_card
              avatar_src={userobject.picture}
              username={userobject.name}
              join_date={joined_date}
            />
            <Stat_card data={stats} />
            <Top_rated
              title={"Top 10 Rated"}
              localStorage_id={"Completed"}
              score={true}
            />
            <Top_rated
              title={"Worst 10 Rated"}
              localStorage_id={"Completed"}
              score={false}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mx-4 items-center justify-center h-[70svh] relative top-20 text-center">
          <h2 className="text-xl font-bold">Unauthenticated</h2>
          <p className="text-neutral-400 text-sm max-w-md">
            Connect your MyAnimeList account to view your user profile and
            stats.
          </p>
          <Link href="/mylist/login" className="mt-4">
            <Button className="bg-neutral-700 hover:bg-neutral-600">
              Go to Login
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
