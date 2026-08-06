import { NextRequest, NextResponse } from "next/server";
import { fetchSearch } from "@/server/mal/client";
import { jsonError, handleUpstreamError } from "@/server/http/responses";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const MAX_SEARCH_QUERY_LENGTH = 120;
const MAX_SEARCH_PAGE = 25;
const SEARCH_LIMIT = 24;
const SEARCH_CACHE_CONTROL =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=60";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
  "Vary": "Cookie",
};

// MAL uses snake_case status strings; the UI (statusClassName in
// animecardhorizontal.tsx) matches the human-readable Jikan strings.
// Map them here so the client never has to know which upstream produced them.
const MAL_STATUS_TO_DISPLAY: Record<string, string> = {
  finished_airing: "Finished Airing",
  currently_airing: "Currently Airing",
  not_yet_aired: "Not yet aired",
};

function mapMalStatus(raw: unknown): string {
  return typeof raw === "string" && MAL_STATUS_TO_DISPLAY[raw]
    ? MAL_STATUS_TO_DISPLAY[raw]
    : typeof raw === "string"
      ? raw
      : "";
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const q = url.searchParams.get("q");
  const pageStr = url.searchParams.get("page");

  const query = q?.trim() || "";
  if (!query || query === "NA") {
    // Preserve the sentinel contract used by SearchPageClient: an empty/NA
    // query is not an error, it simply means "no results".
    return NextResponse.json(
      { data: [] },
      { status: 200, headers: NO_CACHE_HEADERS },
    );
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

  const offset = (page - 1) * SEARCH_LIMIT;

  try {
    const malData = await fetchSearch(query, SEARCH_LIMIT, offset);

    // Normalize status strings on each node so the UI's status pill logic
    // (which keys off "Finished Airing" / "Currently Airing") keeps working
    // without the client knowing about MAL's snake_case values.
    if (Array.isArray(malData?.data)) {
      for (const item of malData.data) {
        if (item && typeof item === "object" && item.node) {
          item.node.status = mapMalStatus(item.node.status);
        }
      }
    }

    return new Response(JSON.stringify(malData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": SEARCH_CACHE_CONTROL,
      },
    });
  } catch (error: any) {
    // fetchSearch throws an Error with a .status for non-ok MAL responses.
    // Validation errors surface as plain Errors without .status.
    if (error?.status) {
      return handleUpstreamError(error);
    }
    return jsonError(error.message || "Internal Server Error", 500);
  }
}
