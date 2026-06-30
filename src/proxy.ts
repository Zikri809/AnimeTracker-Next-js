import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const UNWANTED_CRAWLER_PATTERN =
  /\b(?:GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-User|CCBot|PerplexityBot|Bytespider|Amazonbot|Google-Extended|Applebot-Extended|Meta-ExternalAgent|meta-externalfetcher|cohere-ai|PetalBot|AhrefsBot|SemrushBot|MJ12bot|DotBot|BLEXBot|DataForSeoBot|ImagesiftBot|Diffbot)\b/i;

export function proxy(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";

  if (!UNWANTED_CRAWLER_PATTERN.test(userAgent)) {
    return NextResponse.next();
  }

  return new NextResponse("Automated crawling is not allowed.", {
    status: 403,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export const config = {
  matcher: [
    "/api/:path*",
    "/Anime/:path*",
    "/morethiseseason/:path*",
    "/morelastseason/:path*",
    "/moreupcoming/:path*",
    "/search/:path*",
    "/seasons/:path*",
    "/mylist/:path*",
  ],
};
