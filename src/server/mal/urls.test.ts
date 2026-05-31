import { describe, expect, it } from "vitest";
import {
  buildMalAnimeDetailsUrl,
  buildMalAnimeListStatusUrl,
  buildMalApiUrl,
  buildMalSeasonUrl,
} from "./urls";

describe("MAL URL builders", () => {
  it("builds seasonal URLs on the trusted MAL origin from allowlisted seasons", () => {
    const params = new URLSearchParams({
      sort: "anime_score",
      limit: "500",
      offset: "0",
    });

    const url = new URL(buildMalSeasonUrl(2026, "spring", params));

    expect(url.origin).toBe("https://api.myanimelist.net");
    expect(url.pathname).toBe("/v2/anime/season/2026/spring");
    expect(url.searchParams.get("sort")).toBe("anime_score");
  });

  it("rejects unexpected seasonal path segments at the URL sink", () => {
    const params = new URLSearchParams({ limit: "500" });

    expect(() => buildMalSeasonUrl(2026, "../admin" as any, params)).toThrow(
      "Invalid season",
    );
  });

  it("rejects inherited object keys as season values", () => {
    const params = new URLSearchParams({ limit: "500" });

    expect(() => buildMalSeasonUrl(2026, "toString" as any, params)).toThrow(
      "Invalid season",
    );
  });

  it("rejects malformed seasonal years at the URL sink", () => {
    const params = new URLSearchParams({ limit: "500" });

    expect(() => buildMalSeasonUrl(20 as any, "spring", params)).toThrow(
      "Year must be exactly 4 digits",
    );
  });

  it("encodes dynamic numeric path segments instead of changing the upstream host", () => {
    const url = new URL(buildMalApiUrl(["anime", "1", "my_list_status"]));

    expect(url.origin).toBe("https://api.myanimelist.net");
    expect(url.pathname).toBe("/v2/anime/1/my_list_status");
  });

  it("builds anime detail URLs with digit-only ids on the trusted MAL origin", () => {
    const url = new URL(buildMalAnimeDetailsUrl(1));

    expect(url.origin).toBe("https://api.myanimelist.net");
    expect(url.pathname).toBe("/v2/anime/1");
  });

  it("builds anime list status URLs with digit-only ids on the trusted MAL origin", () => {
    const url = new URL(buildMalAnimeListStatusUrl(1));

    expect(url.origin).toBe("https://api.myanimelist.net");
    expect(url.pathname).toBe("/v2/anime/1/my_list_status");
  });

  it.each([0, -1, 0.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects malformed anime ids before building URLs",
    (animeId) => {
      expect(() => buildMalAnimeDetailsUrl(animeId)).toThrow(
        "Anime ID must be a positive integer",
      );
      expect(() => buildMalAnimeListStatusUrl(animeId)).toThrow(
        "Anime ID must be a positive integer",
      );
    },
  );

  it.each([
    ["empty", ""],
    ["current directory", "."],
    ["parent directory", ".."],
    ["forward slash", "anime/1"],
    ["backslash", "anime\\1"],
  ])("rejects %s path segments", (_label, segment) => {
    expect(() => buildMalApiUrl(["anime", segment, "users"])).toThrow(
      "Invalid MAL API path segment",
    );
  });
});
