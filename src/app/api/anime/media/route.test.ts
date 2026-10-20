import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { fetchAniListBannerImage, fetchJikanTrailerEmbedUrl } from "@/server/anime/jikan-detail";

vi.mock("@/server/anime/jikan-detail", () => ({
  fetchAniListBannerImage: vi.fn(),
  fetchJikanTrailerEmbedUrl: vi.fn(),
}));

afterEach(() => vi.resetAllMocks());

describe("GET /api/anime/media", () => {
  it.each(["", "0", "-1", "abc", "1.5", "Infinity", "9007199254740992"])(
    "rejects invalid ID %s before contacting upstreams", async (id) => {
      const response = await GET(new NextRequest(`http://localhost/api/anime/media?id=${id}`));
      expect(response.status).toBe(400);
      expect(fetchJikanTrailerEmbedUrl).not.toHaveBeenCalled();
      expect(fetchAniListBannerImage).not.toHaveBeenCalled();
    },
  );

  it("preserves the banner when the trailer is unavailable", async () => {
    vi.mocked(fetchJikanTrailerEmbedUrl).mockResolvedValue(null);
    vi.mocked(fetchAniListBannerImage).mockResolvedValue("https://example.com/banner.jpg");
    const response = await GET(new NextRequest("http://localhost/api/anime/media?id=21"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      trailerEmbedUrl: null,
      bannerImageUrl: "https://example.com/banner.jpg",
    });
    expect(fetchJikanTrailerEmbedUrl).toHaveBeenCalledWith(21);
    expect(fetchAniListBannerImage).toHaveBeenCalledWith(21);
  });
});
