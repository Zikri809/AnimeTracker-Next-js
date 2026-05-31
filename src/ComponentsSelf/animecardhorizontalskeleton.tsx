import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export default function AnimeCardHorizontalSkeleton() {
  return (
    <Card className="rounded-none w-full overflow-x-hidden border-l-1 text-white border-x-0 border-t-0 py-5 px-1 sm:px-4 mx-0 border-gray-700 bg-black">
      <CardContent className="flex p-0 flex-row gap-5 max-w-screen items-center">
        {/* Mocking the Image */}
        <Skeleton className="bg-neutral-900 rounded-sm h-55 w-35 sm:w-40" />

        {/* Content Section */}
        <div className="flex flex-col items-start h-55 w-80 justify-between py-1">
          {/* Status Badge skeleton */}
          <div className="flex flex-row gap-1">
            <Skeleton className="bg-neutral-900 w-24 h-7 rounded-md" />
          </div>

          {/* Season & Episode label skeleton */}
          <div className="flex text-sm flex-row gap-2">
            <Skeleton className="bg-neutral-900 w-16 h-4" />
            <Skeleton className="bg-neutral-900 w-20 h-4" />
          </div>

          {/* Title skeleton */}
          <div className="w-full pr-2 sm:pr-auto">
            <Skeleton className="bg-neutral-900 w-4/5 h-6 mb-1" />
            <Skeleton className="bg-neutral-900 w-1/2 h-4 hidden sm:block" />
          </div>

          {/* Stats details skeleton */}
          <div className="flex flex-row gap-10 text-sm text-gray-400">
            <div className="flex flex-col gap-1">
              <Skeleton className="bg-neutral-900 w-12 h-4" />
              <Skeleton className="bg-neutral-900 w-16 h-3" />
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="bg-neutral-900 w-8 h-4" />
              <Skeleton className="bg-neutral-900 w-14 h-3" />
            </div>
          </div>

          {/* Genre/Watch Progress skeleton */}
          <div className="flex flex-row gap-2 w-[95%] items-center">
            <Skeleton className="bg-neutral-900 w-16 h-6 rounded-sm" />
            <Skeleton className="bg-neutral-900 w-16 h-6 rounded-sm" />
            <Skeleton className="bg-neutral-900 w-16 h-6 rounded-sm hidden sm:block" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
