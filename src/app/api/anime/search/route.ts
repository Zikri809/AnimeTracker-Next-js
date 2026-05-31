import { NextRequest } from "next/server";
import { jsonOk, jsonError } from "@/server/http/responses";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const JIKAN_ANIME_SEARCH_ORIGIN = "https://api.jikan.moe";
const MAX_SEARCH_QUERY_LENGTH = 120;
const MAX_SEARCH_PAGE = 25;

function buildJikanSearchUrl(query: string, page: number) {
  const jikanUrl = new URL("/v4/anime", JIKAN_ANIME_SEARCH_ORIGIN);
  jikanUrl.searchParams.set("limit", "24");
  jikanUrl.searchParams.set("sfw", "true");
  jikanUrl.searchParams.set("page", page.toString());
  jikanUrl.searchParams.set("q", query);

  if (jikanUrl.origin !== JIKAN_ANIME_SEARCH_ORIGIN) {
    throw new Error("Invalid upstream search origin");
  }

  return jikanUrl.toString();
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const q = url.searchParams.get("q");
  const pageStr = url.searchParams.get("page");

  const query = q?.trim() || "";
  if (!query || query === "NA") {
    return jsonOk({ data: [] });
  }

  if (query.length > MAX_SEARCH_QUERY_LENGTH) {
    return jsonError("Search query is too long", 400);
  }

  let page = 1;
  if (pageStr) {
    const parsedPage = parseInt(pageStr, 10);
    if (!isNaN(parsedPage) && parsedPage > 0 && parsedPage <= MAX_SEARCH_PAGE) {
      page = parsedPage;
    }
  }

  try {
    const jikanUrl = buildJikanSearchUrl(query, page);
    const response = await fetch(jikanUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return jsonError(
        `Upstream Jikan search error: HTTP ${response.status}`,
        response.status,
      );
    }

    const responseData = await response.json();

    // Return with Cache-Control headers for Edge caching
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=60",
      },
    });
  } catch (error: any) {
    return jsonError(error.message || "Internal Server Error", 500);
  }
}
