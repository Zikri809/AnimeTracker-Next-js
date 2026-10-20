const JIKAN_TRAILER_REVALIDATE_SECONDS = 43200;
const MEDIA_TIMEOUT_MS = 2000;

async function fetchMediaJson(url: string, init: RequestInit) {
  const controller = new AbortController();
  // Keep the deadline active through body parsing, not only response headers.
  const timeout = setTimeout(() => controller.abort(), MEDIA_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return response.ok ? await response.json() : null;
  } finally {
    clearTimeout(timeout);
  }
}

// Trailer URLs are not exposed by the official MAL API, so Jikan remains
// an optional enrichment loaded after the MAL detail page has rendered.
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
    const json = await fetchMediaJson(
      `https://api.jikan.moe/v4/anime/${targetAnimeId}/full`,
      { next: { revalidate: JIKAN_TRAILER_REVALIDATE_SECONDS } },
    );

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

    const payload = await fetchMediaJson("https://graphql.anilist.co", {
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

    const bannerImage = payload?.data?.Media?.bannerImage;
    return typeof bannerImage === "string" && bannerImage.trim() !== "" ? bannerImage : null;
  } catch {
    return null;
  }
}
