"use client";

import Login_navbar from "@/ComponentsSelf/navbar/log_in_navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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

    // 2b. Clear the previously-authenticated marker (explicit logout, not expiry)
    localStorage.removeItem("wasAuthenticated");

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
    <div className="w-screen h-[100svh] flex flex-col items-center justify-center px-6">
      <Login_navbar />
      <div className="flex flex-col gap-6 items-center p-8 rounded-2xl bg-neutral-900/90 border border-neutral-700 shadow-lg max-w-md w-full text-center">
        <div className="h-40 w-40 rounded-full bg-neutral-800 flex items-center justify-center">
          <img
            className="h-28 w-28 object-contain"
            src="/svg-illustration/Alone-rafiki.svg"
            alt="Logged out"
          />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-white">You&apos;ve Been Logged Out</h1>
          <p className="text-neutral-300 text-sm">
            Your session ended and all watchlists on this device were cleared.
          </p>
          <p className="text-neutral-400 text-sm">
            Redirecting to My List in {timer} second{timer === 1 ? "" : "s"}…
          </p>
        </div>
        <Button asChild className="w-full bg-white text-black hover:bg-neutral-200 font-bold">
          <Link href="/mylist">Back to My List</Link>
        </Button>
      </div>
    </div>
  );
}
