import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.Prod_host ||
  "https://anime-tracker-next-js.vercel.app/"
).replace(/\/$/, "");

const OUTPUT_PATH = "public/sitemap-static.xml";
const MAL_SEASON_LIMIT = 500;
const ANIME_SEASONS = ["winter", "spring", "summer", "fall"];

const STATIC_PATHS = [
  "/",
  "/search/NA",
  "/morethiseseason",
  "/morelastseason",
  "/moreupcoming",
];

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const separatorIndex = trimmed.indexOf("=");
  if (separatorIndex === -1) return null;

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

async function loadLocalEnv() {
  if (!existsSync(".env")) return;

  const contents = await readFile(".env", "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const entry = parseEnvLine(line);
    if (entry && process.env[entry.key] === undefined) {
      process.env[entry.key] = entry.value;
    }
  }
}

function getSeasonWindow(now = new Date()) {
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  let currentSeason;

  if (currentMonth <= 3) {
    currentSeason = "winter";
  } else if (currentMonth <= 6) {
    currentSeason = "spring";
  } else if (currentMonth <= 9) {
    currentSeason = "summer";
  } else {
    currentSeason = "fall";
  }

  const currentIdx = ANIME_SEASONS.indexOf(currentSeason);
  const past =
    currentIdx === 0
      ? { season: "fall", year: currentYear - 1 }
      : { season: ANIME_SEASONS[currentIdx - 1], year: currentYear };
  const current = { season: currentSeason, year: currentYear };
  const upcoming =
    currentIdx === ANIME_SEASONS.length - 1
      ? { season: "winter", year: currentYear + 1 }
      : { season: ANIME_SEASONS[currentIdx + 1], year: currentYear };

  return { past, current, upcoming };
}

function getSeasonCarouselWindow(now = new Date()) {
  const { current } = getSeasonWindow(now);
  const currentIdx = ANIME_SEASONS.indexOf(current.season);
  const currentVal = current.year * 4 + currentIdx;
  const seasons = [];

  for (let offset = -6; offset <= 2; offset += 1) {
    const value = currentVal + offset;
    const year = Math.floor(value / 4);
    const seasonIdx = ((value % 4) + 4) % 4;
    seasons.push({ season: ANIME_SEASONS[seasonIdx], year });
  }

  return seasons;
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function fetchSeasonAnimeIds({ season, year }) {
  const clientId = process.env.Client_ID;
  if (!clientId) {
    console.warn("Skipping MAL anime detail URLs: Client_ID is not configured.");
    return [];
  }

  const params = new URLSearchParams({
    sort: "descending",
    limit: MAL_SEASON_LIMIT.toString(),
    offset: "0",
    fields: "id,start_season",
  });
  const url = `https://api.myanimelist.net/v2/anime/season/${year}/${season}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        "X-MAL-CLIENT-ID": clientId,
      },
    });

    if (!response.ok) {
      console.warn(
        `Skipping MAL anime detail URLs for ${season} ${year}: API returned ${response.status}.`,
      );
      return [];
    }

    const raw = await response.json();
    if (!raw || !Array.isArray(raw.data)) return [];

    return raw.data
      .map((item) => item?.node)
      .filter((node) => {
        const id = node?.id;
        const startSeason = node?.start_season;
        return (
          Number.isSafeInteger(id) &&
          id > 0 &&
          startSeason?.season === season &&
          startSeason?.year === year
        );
      })
      .map((node) => node.id);
  } catch (error) {
    console.warn(
      `Skipping MAL anime detail URLs for ${season} ${year}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return [];
  }
}

function toUrlXml(path) {
  return `  <url>\n    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>\n  </url>`;
}

await loadLocalEnv();

const seasonPaths = getSeasonCarouselWindow().map(
  ({ season, year }) => `/seasons/${season}/${year}`,
);
const { past, current, upcoming } = getSeasonWindow();
const animeIds = new Set();

for (const seasonInput of [past, current, upcoming]) {
  for (const id of await fetchSeasonAnimeIds(seasonInput)) {
    animeIds.add(id);
  }
}

const paths = [
  ...STATIC_PATHS,
  ...seasonPaths,
  ...Array.from(animeIds)
    .sort((a, b) => a - b)
    .map((id) => `/Anime/${id}`),
];
const uniquePaths = Array.from(new Set(paths));

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniquePaths
  .map(toUrlXml)
  .join("\n")}\n</urlset>\n`;

await writeFile(OUTPUT_PATH, xml, "utf8");
console.log(`Wrote ${OUTPUT_PATH} with ${uniquePaths.length} URLs.`);
