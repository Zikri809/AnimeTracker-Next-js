import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export default function AnimeCardSkeleton() {
  return (
    <Card className="media-card h-[19rem] w-[10rem] flex-none p-0 sm:h-[23rem] sm:w-[13.25rem]">
      <CardContent className="flex h-full flex-col p-2">
        <Skeleton className="mb-3 aspect-[2/3] w-full rounded-md bg-white/[0.06]" />
        <CardTitle className="mb-2">
          <Skeleton className="h-4 w-5/6 bg-white/[0.06]" />
          <Skeleton className="mt-2 h-4 w-2/3 bg-white/[0.06]" />
        </CardTitle>
        <CardDescription className="mt-auto grid grid-cols-[1fr_auto] items-end gap-2">
          <Skeleton className="h-3 w-10 bg-white/[0.06]" />
          <Skeleton className="h-3 w-10 bg-white/[0.06]" />
          <Skeleton className="col-span-2 h-3 w-24 bg-white/[0.06]" />
        </CardDescription>
      </CardContent>
    </Card>
  );
}
