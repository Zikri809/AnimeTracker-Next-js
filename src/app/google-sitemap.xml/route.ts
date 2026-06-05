import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/seo";
import { generateSeasonStaticParams } from "@/server/seasonal/page-season";

const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly";
}> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/search/NA", priority: 0.7, changeFrequency: "weekly" },
  { path: "/morethiseseason", priority: 0.9, changeFrequency: "daily" },
  { path: "/morelastseason", priority: 0.75, changeFrequency: "weekly" },
  { path: "/moreupcoming", priority: 0.8, changeFrequency: "daily" },
];

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const lastModified = new Date().toISOString();
  const seasonRoutes = generateSeasonStaticParams().map(({ season, year }) => ({
    path: `/seasons/${season}/${year}`,
    priority: 0.8,
    changeFrequency: "weekly" as const,
  }));

  const urls = [...STATIC_ROUTES, ...seasonRoutes]
    .map(
      ({ path, priority, changeFrequency }) => `<url>
<loc>${escapeXml(absoluteUrl(path))}</loc>
<lastmod>${lastModified}</lastmod>
<changefreq>${changeFrequency}</changefreq>
<priority>${priority}</priority>
</url>`,
    )
    .join("\n");

  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=86400",
      },
    },
  );
}
