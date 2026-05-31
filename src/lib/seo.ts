import type { Metadata } from "next";

export const SITE_NAME = "AniJikan";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://anime-tracker-next-js.vercel.app";

export const DEFAULT_DESCRIPTION =
  "Discover trending, seasonal, and upcoming anime. Track watch progress, manage your anime watchlist, and explore ratings, trailers, studios, genres, and related anime.";

export const DEFAULT_KEYWORDS = [
  "anime tracker",
  "anime watchlist",
  "anime season list",
  "seasonal anime",
  "upcoming anime",
  "anime discovery",
  "track anime episodes",
  "MyAnimeList tracker",
];

export const OG_IMAGE_PATH = "/android/android-launchericon-512-512.png";

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function createMetadata(
  input: {
    title?: string;
    description?: string;
    path?: string;
    image?: string | null;
    keywords?: string[];
    noIndex?: boolean;
    type?: "website" | "article";
  } = {},
): Metadata {
  const title = input.title || SITE_NAME;
  const description = input.description || DEFAULT_DESCRIPTION;
  const path = input.path || "/";
  const image = input.image || OG_IMAGE_PATH;

  return {
    title,
    description,
    keywords: input.keywords || DEFAULT_KEYWORDS,
    alternates: {
      canonical: absoluteUrl(path),
    },
    robots: input.noIndex
      ? {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      type: input.type || "website",
      images: [
        {
          url: absoluteUrl(image),
          width: 512,
          height: 512,
          alt: `${SITE_NAME} app icon`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(image)],
    },
  };
}

export function truncateDescription(
  text: string | null | undefined,
  fallback = DEFAULT_DESCRIPTION,
) {
  if (!text) return fallback;
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= 155) return compact;
  return `${compact.slice(0, 152).replace(/\s+\S*$/, "")}...`;
}
