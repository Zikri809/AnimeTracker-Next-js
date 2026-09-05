const JIKAN_TRAILER_REVALIDATE_SECONDS = 43200;

// Trailer URLs are not exposed by the official MAL API, so Jikan remains a
// purely cosmetic enrichment for the detail page. It must never block
// rendering: callers treat any failure (including rate limiting) as "no
// trailer" and the page still renders fully from MAL data.
export async function fetchJikanTrailerEmbedUrl(
  targetAnimeId: number,
): Promise<string | null> {
  if (process.env.PLAYWRIGHT_TEST === 'true') {
    if (targetAnimeId === 1) {
      return "https://www.youtube.com/embed/gY5nDXOtv_o?enablejsapi=1";
    }
    return null;
  }

  try {
    const response = await fetch(
      `https://api.jikan.moe/v4/anime/${targetAnimeId}/full`,
      { next: { revalidate: JIKAN_TRAILER_REVALIDATE_SECONDS } },
    );

    if (!response.ok) return null;

    const json = await response.json();
    const embedUrl = json?.data?.trailer?.embed_url;
    return typeof embedUrl === "string" && embedUrl.trim() !== ""
      ? embedUrl
      : null;
  } catch {
    return null;
  }
}

export async function fetchAniListBannerImage(malId: number): Promise<string | null> {
  if (process.env.PLAYWRIGHT_TEST === 'true') {
    return null;
  }

  try {
    const query = `query MediaByMalId($idMal: Int) {
      Media(idMal: $idMal, type: ANIME) {
        bannerImage
      }
    }`;

    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { idMal: malId },
      }),
      next: { revalidate: 43200 },
    });

    if (!response.ok) return null;

    const payload = await response.json();
    const bannerImage = payload?.data?.Media?.bannerImage;
    return typeof bannerImage === "string" && bannerImage.trim() !== "" ? bannerImage : null;
  } catch {
    return null;
  }
}
