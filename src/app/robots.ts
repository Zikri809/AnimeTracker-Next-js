import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

const UNWANTED_CRAWLERS = [
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "Claude-User",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "Bytespider",
  "Meta-ExternalAgent",
  "meta-externalfetcher",
  "cohere-ai",
  "PetalBot",
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "BLEXBot",
  "DataForSeoBot",
  "ImagesiftBot",
  "Diffbot",
];

const DISALLOWED_PATHS = [
  "/api/",
  "/ExceedRetryLimit",
  "/mylist/",
  "/search/",
  "/morethiseseason/",
  "/morelastseason/",
  "/moreupcoming/",
  "/Anime/*/relation/",
  "/Anime/*/tracking",
  "/seasons/*/*/*",
  "/*?*",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_PATHS,
      },
      ...UNWANTED_CRAWLERS.map((userAgent) => ({
        userAgent,
        disallow: "/",
      })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
