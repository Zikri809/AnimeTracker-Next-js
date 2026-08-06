import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as seasonalGET } from "./seasonal/route";
import { GET as detailsGET } from "./anime/anime_details/route";
import { GET as searchGET } from "./anime/search/route";
import { GET as userDataGET } from "./users/data/user_data/route";
import { GET as userListGET } from "./users/data/userlist/route";
import {
  GET as saveGET,
  POST as savePOST,
} from "./users/data/save_anime/route";
import {
  GET as deleteGET,
  DELETE as deleteDELETE,
} from "./users/data/delete_anime/route";
import * as malClient from "@/server/mal/client";
import { COOKIES } from "@/server/http/cookies";

vi.mock("@/server/mal/client", () => ({
  fetchSeasonal: vi.fn(),
  fetchAnimeDetails: vi.fn(),
  fetchSearch: vi.fn(),
  fetchUserData: vi.fn(),
  fetchUserList: vi.fn(),
  saveAnime: vi.fn(),
  deleteAnime: vi.fn(),
}));

describe("Data Proxy Route Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/seasonal", () => {
    it("returns 400 if validation fails", async () => {
      const req = new NextRequest(
        "http://localhost/api/seasonal?year=202&season=spring",
      );
      const res = await seasonalGET(req);
      expect(res.status).toBe(400);
      expect(malClient.fetchSeasonal).not.toHaveBeenCalled();
    });

    it("rejects seasonal path traversal before calling MAL", async () => {
      const req = new NextRequest(
        "http://localhost/api/seasonal?year=2026&season=../admin",
      );
      const res = await seasonalGET(req);
      expect(res.status).toBe(400);
      expect(malClient.fetchSeasonal).not.toHaveBeenCalled();
    });

    it("returns MAL seasonal data on success", async () => {
      vi.mocked(malClient.fetchSeasonal).mockResolvedValue({ data: [] });
      const req = new NextRequest(
        "http://localhost/api/seasonal?year=2026&season=spring",
      );
      const res = await seasonalGET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({ data: [] });
    });
  });

  describe("GET /api/anime/anime_details", () => {
    it("returns 401 if access token is missing", async () => {
      const req = new NextRequest(
        "http://localhost/api/anime/anime_details?id=123",
      );
      const res = await detailsGET(req);
      expect(res.status).toBe(401);
    });

    it("returns details data on success", async () => {
      vi.mocked(malClient.fetchAnimeDetails).mockResolvedValue({
        title: "Anime",
      });
      const req = new NextRequest(
        "http://localhost/api/anime/anime_details?id=123",
        {
          headers: { cookie: `${COOKIES.ACCESS_TOKEN}=access123` },
        },
      );
      const res = await detailsGET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({ title: "Anime" });
    });
  });

  describe("GET /api/users/data/user_data", () => {
    it("returns 401 if access token is missing", async () => {
      const req = new NextRequest("http://localhost/api/users/data/user_data");
      const res = await userDataGET(req);
      expect(res.status).toBe(401);
    });

    it("returns user profile and sets user_data cookie on success", async () => {
      const profile = { name: "Zikri" };
      vi.mocked(malClient.fetchUserData).mockResolvedValue(profile);

      const req = new NextRequest("http://localhost/api/users/data/user_data", {
        headers: { cookie: `${COOKIES.ACCESS_TOKEN}=access123` },
      });
      const res = await userDataGET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.user_data).toEqual(profile);

      const setCookies = res.headers.getSetCookie();
      expect(setCookies.join(";")).toContain(COOKIES.USER_DATA);
    });
  });

  describe("GET /api/users/data/userlist", () => {
    it("returns 400 on invalid query params", async () => {
      const req = new NextRequest(
        "http://localhost/api/users/data/userlist?status=watching&sort=invalid_sort",
        {
          headers: { cookie: `${COOKIES.ACCESS_TOKEN}=access123` },
        },
      );
      const res = await userListGET(req);
      expect(res.status).toBe(400);
    });

    it("returns userlist on success", async () => {
      vi.mocked(malClient.fetchUserList).mockResolvedValue({ data: [] });
      const req = new NextRequest(
        "http://localhost/api/users/data/userlist?status=watching&sort=list_score&offset=0",
        {
          headers: { cookie: `${COOKIES.ACCESS_TOKEN}=access123` },
        },
      );
      const res = await userListGET(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("Cache-Control")).toContain("no-store");
      expect(res.headers.get("Vary")).toBe("Cookie");
      const body = await res.json();
      expect(body).toEqual({ data: [] });
    });
  });

  describe("GET/POST /api/users/data/save_anime", () => {
    it("returns 403 on cross-origin requests", async () => {
      const req = new NextRequest(
        "http://localhost/api/users/data/save_anime",
        {
          headers: {
            cookie: `${COOKIES.ACCESS_TOKEN}=access123`,
            origin: "http://malicious-site.com",
          },
        },
      );
      const res = await saveGET(req);
      expect(res.status).toBe(403);
    });

    it("saves anime via GET request successfully", async () => {
      vi.mocked(malClient.saveAnime).mockResolvedValue({ status: "watching" });
      const req = new NextRequest(
        "http://localhost/api/users/data/save_anime?anime_id=123&status=watching&score=9&episode=4",
        {
          headers: {
            cookie: `${COOKIES.ACCESS_TOKEN}=access123`,
            origin: "http://localhost",
          },
        },
      );
      const res = await saveGET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.message).toBe("successfully updated");
      expect(malClient.saveAnime).toHaveBeenCalledWith(
        "access123",
        123,
        "watching",
        9,
        4,
      );
    });

    it("rejects GET anime id path traversal before calling MAL", async () => {
      const req = new NextRequest(
        "http://localhost/api/users/data/save_anime?anime_id=../admin&status=watching&score=9&episode=4",
        {
          headers: {
            cookie: `${COOKIES.ACCESS_TOKEN}=access123`,
            origin: "http://localhost",
          },
        },
      );
      const res = await saveGET(req);
      expect(res.status).toBe(400);
      expect(malClient.saveAnime).not.toHaveBeenCalled();
    });

    it("keeps legacy GET mutation compatibility when Origin and Referer are absent", async () => {
      vi.mocked(malClient.saveAnime).mockResolvedValue({ status: "watching" });
      const req = new NextRequest(
        "http://localhost/api/users/data/save_anime?anime_id=123&status=watching&score=9&episode=4",
        {
          headers: {
            cookie: `${COOKIES.ACCESS_TOKEN}=access123`,
          },
        },
      );
      const res = await saveGET(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("Cache-Control")).toContain("no-store");
      expect(res.headers.get("Vary")).toBe("Cookie");
      expect(malClient.saveAnime).toHaveBeenCalledWith(
        "access123",
        123,
        "watching",
        9,
        4,
      );
    });

    it("saves anime via POST request successfully", async () => {
      vi.mocked(malClient.saveAnime).mockResolvedValue({ status: "watching" });
      const req = new NextRequest(
        "http://localhost/api/users/data/save_anime",
        {
          method: "POST",
          headers: {
            cookie: `${COOKIES.ACCESS_TOKEN}=access123`,
            origin: "http://localhost",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            anime_id: 123,
            status: "watching",
            score: 9,
            episode: 4,
          }),
        },
      );
      const res = await savePOST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.message).toBe("successfully updated");
      expect(malClient.saveAnime).toHaveBeenCalledWith(
        "access123",
        123,
        "watching",
        9,
        4,
      );
    });

    it("rejects POST anime id path traversal before calling MAL", async () => {
      const req = new NextRequest(
        "http://localhost/api/users/data/save_anime",
        {
          method: "POST",
          headers: {
            cookie: `${COOKIES.ACCESS_TOKEN}=access123`,
            origin: "http://localhost",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            anime_id: "../admin",
            status: "watching",
            score: 9,
            episode: 4,
          }),
        },
      );
      const res = await savePOST(req);
      expect(res.status).toBe(400);
      expect(malClient.saveAnime).not.toHaveBeenCalled();
    });
  });

  describe("GET/DELETE /api/users/data/delete_anime", () => {
    it("deletes anime via DELETE successfully", async () => {
      vi.mocked(malClient.deleteAnime).mockResolvedValue(true);
      const req = new NextRequest(
        "http://localhost/api/users/data/delete_anime?anime_id=123",
        {
          method: "DELETE",
          headers: {
            cookie: `${COOKIES.ACCESS_TOKEN}=access123`,
            origin: "http://localhost",
          },
        },
      );
      const res = await deleteDELETE(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("Cache-Control")).toContain("no-store");
      expect(res.headers.get("Vary")).toBe("Cookie");
      const body = await res.json();
      expect(body.message).toBe("successfully deleted");
      expect(malClient.deleteAnime).toHaveBeenCalledWith("access123", "123");
    });
  });

  describe("GET /api/anime/search", () => {
    it("returns empty array if q is missing, empty, or NA", async () => {
      const reqEmpty = new NextRequest("http://localhost/api/anime/search");
      const resEmpty = await searchGET(reqEmpty);
      expect(resEmpty.status).toBe(200);
      expect(await resEmpty.json()).toEqual({ data: [] });
      expect(malClient.fetchSearch).not.toHaveBeenCalled();

      const reqNA = new NextRequest("http://localhost/api/anime/search?q=NA");
      const resNA = await searchGET(reqNA);
      expect(resNA.status).toBe(200);
      expect(await resNA.json()).toEqual({ data: [] });
      expect(malClient.fetchSearch).not.toHaveBeenCalled();
    });

    it("returns MAL search data on success with caching headers and page→offset translation", async () => {
      const mockMalResponse = {
        data: [
          {
            node: {
              id: 12345,
              title: "Test MAL Anime",
              main_picture: { large: "https://cdn.myanimelist.net/large.jpg" },
              status: "currently_airing",
              start_season: { season: "spring", year: 2024 },
              num_episodes: 12,
              mean: 8.5,
              num_scoring_users: 1000,
              popularity: 42,
              genres: [{ id: 1, name: "Action" }],
              alternative_titles: { en: "Test MAL Anime EN" },
            },
          },
        ],
        paging: { next: "https://api.myanimelist.net/v2/anime?offset=24" },
      };

      vi.mocked(malClient.fetchSearch).mockResolvedValue(mockMalResponse);

      const req = new NextRequest(
        "http://localhost/api/anime/search?q=test&page=2",
      );
      const res = await searchGET(req);

      expect(res.status).toBe(200);
      expect(res.headers.get("Cache-Control")).toBe(
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=60",
      );

      const body = await res.json();
      // Status should be mapped from snake_case to the human-readable form
      // the UI's statusClassName() helper expects.
      expect(body.data[0].node.status).toBe("Currently Airing");
      expect(body.data[0].node.id).toBe(12345);
      expect(malClient.fetchSearch).toHaveBeenCalledWith("test", 24, 24);

      vi.mocked(malClient.fetchSearch).mockReset();
    });

    it("maps all known MAL status strings to their display equivalents", async () => {
      const statuses = [
        ["finished_airing", "Finished Airing"],
        ["currently_airing", "Currently Airing"],
        ["not_yet_aired", "Not yet aired"],
      ] as const;

      for (const [raw, display] of statuses) {
        vi.mocked(malClient.fetchSearch).mockResolvedValue({
          data: [{ node: { id: 1, status: raw } }],
        });
        const req = new NextRequest(
          `http://localhost/api/anime/search?q=x&status=${raw}`,
        );
        const res = await searchGET(req);
        const body = await res.json();
        expect(body.data[0].node.status).toBe(display);
        vi.mocked(malClient.fetchSearch).mockReset();
      }
    });

    it("passes unknown MAL status strings through unchanged", async () => {
      vi.mocked(malClient.fetchSearch).mockResolvedValue({
        data: [{ node: { id: 1, status: "some_new_mal_status" } }],
      });
      const req = new NextRequest("http://localhost/api/anime/search?q=x");
      const res = await searchGET(req);
      const body = await res.json();
      expect(body.data[0].node.status).toBe("some_new_mal_status");
      vi.mocked(malClient.fetchSearch).mockReset();
    });

    it("rejects overly long search queries before calling MAL", async () => {
      const longQuery = "a".repeat(121);
      const req = new NextRequest(
        `http://localhost/api/anime/search?q=${longQuery}`,
      );
      const res = await searchGET(req);

      expect(res.status).toBe(400);
      expect(malClient.fetchSearch).not.toHaveBeenCalled();
    });

    it("computes offset from page for several pages", async () => {
      vi.mocked(malClient.fetchSearch).mockResolvedValue({ data: [] });

      // page 1 → offset 0
      await searchGET(
        new NextRequest("http://localhost/api/anime/search?q=x&page=1"),
      );
      expect(malClient.fetchSearch).toHaveBeenLastCalledWith("x", 24, 0);

      // page 3 → offset 48
      await searchGET(
        new NextRequest("http://localhost/api/anime/search?q=x&page=3"),
      );
      expect(malClient.fetchSearch).toHaveBeenLastCalledWith("x", 24, 48);

      // page 25 (max) → offset 576
      await searchGET(
        new NextRequest("http://localhost/api/anime/search?q=x&page=25"),
      );
      expect(malClient.fetchSearch).toHaveBeenLastCalledWith("x", 24, 576);

      vi.mocked(malClient.fetchSearch).mockReset();
    });

    it("clamps invalid page values to page 1", async () => {
      vi.mocked(malClient.fetchSearch).mockResolvedValue({ data: [] });

      // page 0 → clamped to 1 → offset 0
      await searchGET(
        new NextRequest("http://localhost/api/anime/search?q=x&page=0"),
      );
      expect(malClient.fetchSearch).toHaveBeenLastCalledWith("x", 24, 0);

      // page above max → clamped to 1 → offset 0
      await searchGET(
        new NextRequest("http://localhost/api/anime/search?q=x&page=26"),
      );
      expect(malClient.fetchSearch).toHaveBeenLastCalledWith("x", 24, 0);

      // non-numeric page → clamped to 1 → offset 0
      await searchGET(
        new NextRequest("http://localhost/api/anime/search?q=x&page=abc"),
      );
      expect(malClient.fetchSearch).toHaveBeenLastCalledWith("x", 24, 0);

      vi.mocked(malClient.fetchSearch).mockReset();
    });

    it("maps a 429 rate-limit error from MAL to a 429 response", async () => {
      const rateLimitError: any = new Error(
        "MAL Search API returned status 429: Too Many Requests",
      );
      rateLimitError.status = 429;
      vi.mocked(malClient.fetchSearch).mockRejectedValue(rateLimitError);

      const req = new NextRequest("http://localhost/api/anime/search?q=x");
      const res = await searchGET(req);

      expect(res.status).toBe(429);
      const body = await res.json();
      expect(body.status).toBe(429);
      vi.mocked(malClient.fetchSearch).mockReset();
    });

    it("maps a 502 upstream error from MAL to a 502 response", async () => {
      const upstreamError: any = new Error(
        "MAL Search API returned status 502: Bad Gateway",
      );
      upstreamError.status = 502;
      vi.mocked(malClient.fetchSearch).mockRejectedValue(upstreamError);

      const req = new NextRequest("http://localhost/api/anime/search?q=x");
      const res = await searchGET(req);

      expect(res.status).toBe(502);
      vi.mocked(malClient.fetchSearch).mockReset();
    });

    it("returns 500 for unknown (non-upstream) errors from fetchSearch", async () => {
      vi.mocked(malClient.fetchSearch).mockRejectedValue(
        new Error("Something went wrong without a status"),
      );

      const req = new NextRequest("http://localhost/api/anime/search?q=x");
      const res = await searchGET(req);

      expect(res.status).toBe(500);
      vi.mocked(malClient.fetchSearch).mockReset();
    });

    it("forwards the query string to fetchSearch without mangling it", async () => {
      vi.mocked(malClient.fetchSearch).mockResolvedValue({ data: [] });

      const trickyQuery = "https://internal.example/metadata";
      const req = new NextRequest(
        `http://localhost/api/anime/search?q=${encodeURIComponent(trickyQuery)}`,
      );
      await searchGET(req);

      // The route must pass the query verbatim to fetchSearch; URL-building
      // and origin protection live in src/server/mal/urls.ts and are tested
      // by urls.test.ts, so we only assert the route forwards faithfully.
      expect(malClient.fetchSearch).toHaveBeenCalledWith(
        trickyQuery,
        24,
        0,
      );
      vi.mocked(malClient.fetchSearch).mockReset();
    });
  });
});
