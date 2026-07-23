"use client";

import Login_navbar from "@/ComponentsSelf/navbar/log_in_navbar";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginFailedPage() {
  return (
    <div className="min-h-svh w-full bg-background">
      <Login_navbar />
      <main className="flex min-h-svh items-center justify-center px-4 pt-20 pb-10">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 sm:p-10 backdrop-blur-md">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 ring-1 ring-red-500/30">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Sign-in failed
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We couldn&apos;t complete the sign-in with MyAnimeList. This is
              usually a temporary issue — check your connection and try again.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3">
              <Link href="/mylist/login" className="w-full">
                <Button
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Try again
                </Button>
              </Link>
              <Link href="/mylist" className="w-full">
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  Back to My List
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
