"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Login_navbar from "@/ComponentsSelf/navbar/log_in_navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

type SyncState = "syncing" | "done" | "failed";

const SYNC_TIMEOUT_MS = 130000;

export default function LoginSuccessPage() {
  const router = useRouter();
  const [state, setState] = useState<SyncState>("syncing");

  useEffect(() => {
    let isMounted = true;
    let redirectTimeout: ReturnType<typeof setTimeout> | undefined;

    const scheduleRedirect = (delay: number) => {
      redirectTimeout = setTimeout(() => {
        if (isMounted) router.push("/mylist");
      }, delay);
    };

    const handleComplete = () => {
      if (!isMounted) return;
      setState("done");
      scheduleRedirect(1500);
    };
    const handleError = () => {
      if (!isMounted) return;
      setState("failed");
      scheduleRedirect(4000);
    };

    // PersistentWorker (mounted in root layout) owns the actual sync.
    // This page only observes completion/error events.
    window.addEventListener("watchlist-sync-complete", handleComplete);
    window.addEventListener("watchlist-sync-error", handleError);

    // Fallback in case PersistentWorker never started a sync
    // (e.g. session not yet authenticated when layout mounted).
    const fallbackTimeout = setTimeout(() => {
      if (!isMounted) return;
      setState((prev) => (prev === "syncing" ? "failed" : prev));
      scheduleRedirect(4000);
    }, SYNC_TIMEOUT_MS);

    return () => {
      isMounted = false;
      window.removeEventListener("watchlist-sync-complete", handleComplete);
      window.removeEventListener("watchlist-sync-error", handleError);
      if (redirectTimeout) clearTimeout(redirectTimeout);
      clearTimeout(fallbackTimeout);
    };
  }, [router]);

  return (
    <div className="min-h-svh w-full bg-background">
      <Login_navbar />
      <main className="flex min-h-svh items-center justify-center px-4 pt-20 pb-10">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 sm:p-10 backdrop-blur-md">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
              {state === "syncing" && (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              )}
              {state === "done" && (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              )}
              {state === "failed" && (
                <AlertCircle className="h-6 w-6 text-amber-400" />
              )}
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {state === "syncing" && "Syncing your watchlist"}
              {state === "done" && "You're all set"}
              {state === "failed" && "Sync incomplete"}
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {state === "syncing" &&
                "Fetching your anime list from MyAnimeList. This takes a few seconds."}
              {state === "done" &&
                "Your watchlist is now synced across devices. Redirecting…"}
              {state === "failed" &&
                "We couldn't finish syncing right now. Your list will retry on the next page load."}
            </p>

            {state !== "syncing" && (
              <Button
                onClick={() => router.push("/mylist")}
                size="lg"
                className="mt-8 w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continue to My List
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
