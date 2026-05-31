"use client";

import Login_navbar from "@/ComponentsSelf/navbar/log_in_navbar";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  invalidateSyncSession,
  logoutChannel,
} from "../_lib/mylist-worker-sync";

export default function LogoutSuccessPage() {
  const router = useRouter();
  const [timer, Settimer] = useState(5);

  useEffect(() => {
    // 1. Invalidate active sync sessions locally and across other tabs
    invalidateSyncSession();
    if (logoutChannel) {
      logoutChannel.postMessage("logout");
    }

    // 2. Clear all local watchlists
    localStorage.setItem("Watching", JSON.stringify([]));
    localStorage.setItem("Completed", JSON.stringify([]));
    localStorage.setItem("OnHold", JSON.stringify([]));
    localStorage.setItem("Dropped", JSON.stringify([]));
    localStorage.setItem("PlanToWatch", JSON.stringify([]));

    // 3. Clear session storage keys used by My List
    sessionStorage.removeItem("activetab");
    sessionStorage.removeItem("sort_type");
    sessionStorage.removeItem("sorted_anime");
    sessionStorage.removeItem("slicearr");
    sessionStorage.removeItem("scrollY");

    // 4. Clear other temporary keys
    sessionStorage.removeItem("addflag");

    // Remove keys starting with needstocheck
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("needstocheck")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      console.error("Failed to clear needstocheck keys:", e);
    }

    // 5. Setup redirect timers
    const interval = setInterval(() => {
      Settimer((t) => t - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      router.push("/mylist");
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="bg-black w-full h-[100svh]  flex flex-col items-center">
      <Login_navbar />
      <Card className="bg-black  h-screen w-full relative border-0 flex flex-col items-center justify-center">
        <CardContent className="sm:bg-white/5 bg-black sm:backdrop-blur-md sm:border sm:border-white/10  rounded-2xl p-10 flex w-fit flex-col items-center justify-center">
          <img
            className="h-80 w-80 p-0"
            src="/svg-illustration/Alone-rafiki.svg"
            alt="Logout illustration"
          />
          <h1 className="text-2xl text-white  text-center font-bold">
            Your Anime World Has Been Disconnected
          </h1>
          <p className="mt-2 text-center text-neutral-400 text-sm">
            All watchlist on this device has been removed.
          </p>
          <p className="mt-0 text-center text-neutral-400 text-sm">
            You will be redirected in {timer} seconds. Doesn&apos;t work? Click
            the top left button.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
