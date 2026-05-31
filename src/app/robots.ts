import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

const SEARCH_AND_AI_CRAWLERS = [
  "*",
  "Googlebot",
  "Bingbot",
  "DuckDuckBot",
  "Applebot",
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "Claude-User",
  "CCBot",
  "Google-Extended",
];

const DISALLOWED_PATHS = [
  "/api/",
  "/ExceedRetryLimit",
  "/mylist/login",
  "/mylist/login_failed",
  "/mylist/login_success",
  "/mylist/logout_success",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: SEARCH_AND_AI_CRAWLERS.map((userAgent) => ({
      userAgent,
      allow: "/",
      disallow: DISALLOWED_PATHS,
    })),
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
