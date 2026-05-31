"use client";

import Login_navbar from "@/ComponentsSelf/navbar/log_in_navbar";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { startWatchlistSync } from "../_lib/mylist-worker-sync";

export default function LoginSuccessPage() {
  const router = useRouter();
  const [timer, Settimer] = useState(10);
  const [statusText, setStatusText] = useState("Syncing your watchlists...");

  useEffect(() => {
    let redirectTimeout: any;
    let timerInterval: any;
    let isRedirecting = false;

    const startRedirect = (delay: number) => {
      if (isRedirecting) return;
      isRedirecting = true;
      setStatusText("Your Anime World Connected");

      const targetTime = Math.ceil(delay / 1000);
      Settimer(targetTime);

      timerInterval = setInterval(() => {
        Settimer((t) => (t > 0 ? t - 1 : 0));
      }, 1000);

      redirectTimeout = setTimeout(() => {
        router.push("/mylist");
      }, delay);
    };

    const sync = startWatchlistSync(
      () => {
        startRedirect(10000);
      },
      (err) => {
        console.error("Watchlist sync error:", err);
        setStatusText("Sync failed, redirecting...");
        startRedirect(5000);
      },
    );

    // 30 seconds fallback if worker sync never completes
    const fallbackTimeout = setTimeout(() => {
      if (sync) sync.terminate();
      setStatusText("Sync timeout, redirecting...");
      startRedirect(5000);
    }, 30000);

    return () => {
      if (sync) sync.terminate();
      clearTimeout(fallbackTimeout);
      clearTimeout(redirectTimeout);
      clearInterval(timerInterval);
    };
  }, [router]);

  return (
    <div className="bg-black w-full h-[100svh]  flex flex-col items-center">
      <Login_navbar />
      <Card className="bg-black  h-screen w-full relative border-0 flex flex-col items-center justify-center">
        <CardContent className="sm:bg-white/5 bg-black sm:backdrop-blur-md sm:border sm:border-white/10  rounded-2xl p-10 flex w-fit flex-col items-center justify-center">
          <img
            className="h-80 w-80 p-0"
            src="/svg-illustration/Completed-amico.svg"
            alt="Success illustration"
          />
          <h1 className="text-2xl text-white  text-center font-bold">
            {statusText}
          </h1>
          <p className="mt-2 text-center text-neutral-400 text-sm">
            MAL account will sync your watchlist across devices.
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
