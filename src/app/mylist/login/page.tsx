"use client";

import { useState } from "react";
import Login_navbar from "@/ComponentsSelf/navbar/log_in_navbar";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, LogIn } from "lucide-react";

export default function LoginPage() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  function handleConnect() {
    setIsRedirecting(true);
    window.location.href = "/api/users/auth/authorize";
  }

  return (
    <div className="min-h-svh w-full bg-background">
      <Login_navbar />
      <main className="flex min-h-svh items-center justify-center px-4 pt-20 pb-10">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 sm:p-10 backdrop-blur-md">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
              <LogIn className="h-6 w-6 text-primary" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Sign in to AniJikan
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Connect your MyAnimeList account to sync your watchlist across
              devices.
            </p>

            <Button
              onClick={handleConnect}
              disabled={isRedirecting}
              size="lg"
              className="mt-8 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting to MyAnimeList…
                </>
              ) : (
                <>Continue with MyAnimeList</>
              )}
            </Button>

            <div className="mt-6 flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.03] p-3 text-left">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                You&apos;ll be redirected to MyAnimeList to authorize AniJikan.
                We only access your public profile and anime list. We never see
                your password.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
