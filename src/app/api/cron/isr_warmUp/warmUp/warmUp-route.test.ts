import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as warmUpGET } from "./route";

describe("Cron WarmUp Route Handler", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("stops early and returns 200 when all routes warm successfully", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
    global.fetch = fetchMock;

    const req = new NextRequest("http://localhost/api/cron/isr_warmUp/warmUp");
    const res = await warmUpGET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("success warming all pages");

    // There are 3 static routes + 9 seasonal routes = 12 routes.
    // Fetch should be called exactly 12 times if all succeed on first try.
    expect(fetchMock).toHaveBeenCalledTimes(12);
  });

  it("does not build warm-up fetch URLs from the incoming request origin", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
    global.fetch = fetchMock;

    const req = new NextRequest(
      "http://untrusted.example/api/cron/isr_warmUp/warmUp",
    );
    const res = await warmUpGET(req);

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalled();
    for (const call of fetchMock.mock.calls) {
      expect(String(call[0])).not.toContain("untrusted.example");
      expect(String(call[0])).toMatch(/^http:\/\/localhost:3000\//);
    }
  });

  it("retries failed routes up to 3 times and returns 400 with failed summary", async () => {
    let callCount = 0;
    const fetchMock = vi.fn().mockImplementation((url) => {
      callCount++;
      // Fail for 'morethiseseason', succeed for others
      if (url.includes("morethiseseason")) {
        return Promise.resolve({ ok: false, status: 500 });
      }
      return Promise.resolve({ ok: true, status: 200 });
    });
    global.fetch = fetchMock;

    const req = new NextRequest("http://localhost/api/cron/isr_warmUp/warmUp");
    const res = await warmUpGET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("fail warming all pages");
    expect(body.failedRoutes).toContain("morethiseseason");

    // 11 routes succeed on first attempt.
    // 'morethiseseason' is attempted 3 times (since it fails 3 times).
    // Total calls should be 11 + 3 = 14.
    expect(fetchMock).toHaveBeenCalledTimes(14);
  });
});
