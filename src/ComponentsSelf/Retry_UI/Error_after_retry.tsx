"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from 'lucide-react';
import { useCurrentRoute } from "@/hooks/use-current-route";
import { buildTrackingBackHref, buildDetailBackHref } from "@/lib/routing/path-utils";

interface ErrorExceedRetryLimitProps {
  url: string;
  query: string;
}

export default function ErrorExceedRetryLimit(props: ErrorExceedRetryLimitProps) {
  const { isReady, push } = useCurrentRoute();

  if (!isReady) {
    return <div>Loading...</div>;
  }

  const error_page_url = props.url || "";
  let error_page_query = {};
  try {
    error_page_query = props.query ? JSON.parse(props.query) : {};
  } catch (e) {}

  const backHref = error_page_url.endsWith('/tracking')
    ? buildTrackingBackHref(error_page_url)
    : buildDetailBackHref({ pathname: error_page_url, params: error_page_query });

  return (
    <div className="w-screen h-screen flex flex-row items-center justify-center px-10">
      <div className="flex flex-col gap-4 p-8 rounded-xl bg-neutral-900/90 border border-neutral-700 shadow-lg max-w-md">
        <p className="font-extrabold text-center text-2xl text-white">Service Temporarily Unavailable</p>
        <p className="text-lg text-center text-neutral-300">The anime data provider is down or unreachable. This is not your fault — please try again in a few minutes. 🍜</p>
        <div className="text-md flex flex-row gap-4 items-center justify-center font-extrabold">
          <Button asChild className="hover:bg-neutral-700 flex flex-row gap-1 items-center hover:border-neutral-700 bg-neutral-800 border-2 border-neutral-500 text-white">
            <Link className="flex flex-row items-center gap-2" href={backHref}>
              <ArrowLeft size={32} /> Go Back
            </Link>
          </Button>
          <Button className="hover:bg-neutral-200 bg-white text-black" onClick={() => push(error_page_url)}>Try Again</Button>
        </div>
      </div>
    </div>
  );
}
