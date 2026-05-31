"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Persistent_worker from "@/ComponentsSelf/persistent_worker/persistent_worker";
import Mobile_navbar from "@/ComponentsSelf/navbar/mobile_navbar";
import { SeasonProvider } from "@/context/season-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Persistent_worker>
      <SeasonProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <Analytics />
          <SpeedInsights />
        </QueryClientProvider>
      </SeasonProvider>
      <Mobile_navbar />
    </Persistent_worker>
  );
}
