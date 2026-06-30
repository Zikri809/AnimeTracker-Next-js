import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

describe("crawler protection proxy", () => {
  it("blocks unwanted crawler user agents before expensive routes render", () => {
    const request = new NextRequest("https://example.com/Anime/1", {
      headers: { "user-agent": "Mozilla/5.0 compatible; GPTBot/1.2" },
    });

    const response = proxy(request);

    expect(response.status).toBe(403);
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it("allows normal browsers", () => {
    const request = new NextRequest("https://example.com/Anime/1", {
      headers: { "user-agent": "Mozilla/5.0 Chrome/136.0" },
    });

    expect(proxy(request).status).toBe(200);
  });

  it("keeps conventional search crawlers available for the reduced crawl surface", () => {
    const request = new NextRequest("https://example.com/Anime/1", {
      headers: { "user-agent": "Mozilla/5.0 compatible; Googlebot/2.1" },
    });

    expect(proxy(request).status).toBe(200);
  });
});
