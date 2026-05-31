"use client";

import { use } from "react";
import SearchPageClient from "./SearchPageClient";

type Props = {
  params: Promise<{ title: string }>;
};

export default function SearchTitlePage({ params }: Props) {
  const resolvedParams = use(params);
  // Decode the title parameter to handle spaces, special characters, etc.
  const decodedTitle = decodeURIComponent(resolvedParams.title);

  return <SearchPageClient title={decodedTitle} />;
}
