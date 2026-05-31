"use client";

import React, { use } from "react";
import ErrorExceedRetryLimit from "@/ComponentsSelf/Retry_UI/Error_after_retry";

type SearchParams = {
  original_link?: string;
  original_query?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

function isSafeRelativeUrl(url: string): boolean {
  if (!url) return false;
  // Must start with '/' and not be followed by '/' or '\'
  return /^\/[^/\\]/.test(url) || url === "/";
}

export default function ExceedRetryLimitPage({ searchParams }: Props) {
  const resolvedSearchParams = use(searchParams);
  let original_link = resolvedSearchParams.original_link || "/";
  const original_query = resolvedSearchParams.original_query || "";

  // Open-redirect safety validation: fallback to homepage if unsafe or external link is injected
  if (!isSafeRelativeUrl(original_link)) {
    original_link = "/";
  }

  return <ErrorExceedRetryLimit url={original_link} query={original_query} />;
}
