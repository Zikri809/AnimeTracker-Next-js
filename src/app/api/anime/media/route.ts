import { NextRequest, NextResponse } from "next/server";
import {
  fetchAniListBannerImage,
  fetchJikanTrailerEmbedUrl,
} from "@/server/anime/jikan-detail";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const animeId = Number(id);
  if (!id || !/^\d+$/.test(id) || !Number.isSafeInteger(animeId) || animeId <= 0) {
    return NextResponse.json({ error: "Invalid anime ID" }, { status: 400 });
  }

  const [trailerEmbedUrl, bannerImageUrl] = await Promise.all([
    fetchJikanTrailerEmbedUrl(animeId),
    fetchAniListBannerImage(animeId),
  ]);

  return NextResponse.json({ trailerEmbedUrl, bannerImageUrl });
}
