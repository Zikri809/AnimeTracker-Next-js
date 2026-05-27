import React from "react";
import ErrorExceedRetryLimit from "@/ComponentsSelf/Retry_UI/Error_after_retry";
import { useRouter } from "next/router";

export default function ExceedRetryLimit() {
  const router = useRouter();

  if (!router.isReady) {
    return <div>Loading...</div>;
  }

  const original_link = typeof router.query.original_link === 'string' ? router.query.original_link : "";
  const original_query = typeof router.query.original_query === 'string' ? router.query.original_query : "";

  return (
    <ErrorExceedRetryLimit url={original_link} query={original_query} />
  );
}
