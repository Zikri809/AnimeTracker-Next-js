import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export default function AnimeCardHeaderSkeleton() {
  return (
    <>
      <Card className="rounded-none w-full border-none bg-black p-5 mx-0 text-white">
        <CardContent className="flex p-0 flex-row gap-5 overflow-hidden items-center">
          <Skeleton className="bg-neutral-900 rounded-sm w-50 sm:w-60 h-70" />
          <div className="flex flex-col h-70 overflow-hidden justify-between items-start">
            <Skeleton className="bg-neutral-900 h-8 w-32 rounded-md" />
            <div className="flex text-sm flex-wrap flex-row gap-2">
              <Skeleton className="bg-neutral-900 h-4 w-20" />
              <Skeleton className="bg-neutral-900 hidden sm:block h-4 w-24" />
            </div>
            <Skeleton className="bg-neutral-900 sm:hidden h-4 w-24" />
            <Skeleton className="bg-neutral-900 hidden sm:inline-block h-6 w-96" />
            <div className="flex flex-row gap-3 sm:gap-10 text-sm flex-wrap w-50 sm:w-full text-gray-400">
              <div className="flex flex-col gap-1">
                <Skeleton className="bg-neutral-900 h-4 w-12" />
                <Skeleton className="bg-neutral-900 h-3 w-16" />
              </div>
              <div className="flex flex-col gap-1">
                <Skeleton className="bg-neutral-900 h-4 w-8" />
                <Skeleton className="bg-neutral-900 h-3 w-12" />
              </div>
              <div className="flex flex-col gap-1">
                <Skeleton className="bg-neutral-900 h-4 w-8" />
                <Skeleton className="bg-neutral-900 h-3 w-16" />
              </div>
            </div>
            <div className="sm:flex h-15 hidden flex-row flex-wrap items-center gap-2 sm:w-full">
              <Skeleton className="bg-neutral-900 h-6 w-16 rounded-sm" />
              <Skeleton className="bg-neutral-900 h-6 w-16 rounded-sm" />
              <Skeleton className="bg-neutral-900 h-6 w-16 rounded-sm" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex h-15 bg-neutral-900 sm:hidden flex-row flex-wrap items-center justify-around sm:w-full gap-2">
        <Skeleton className="bg-neutral-900 h-6 w-16 rounded-sm" />
        <Skeleton className="bg-neutral-900 h-6 w-16 rounded-sm" />
        <Skeleton className="bg-neutral-900 h-6 w-16 rounded-sm" />
      </div>
    </>
  );
}
