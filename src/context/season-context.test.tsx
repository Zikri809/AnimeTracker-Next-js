import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchAuthSession, fetchAuthSessionWithRefresh } from '@/lib/auth-session';
import { getSeasonContextValue, SeasonProvider, useSeasonContext } from "./season-context";
import Providers from "../app/providers";
import PersistentWorker, {
  __resetPersistentWorkerForTests,
} from "../ComponentsSelf/persistent_worker/persistent_worker";

vi.mock("@/lib/auth-session", () => ({
  fetchAuthSession: vi.fn(() => Promise.resolve({
    authenticated: false,
    accessTokenExpiresAt: null,
    hasRefreshToken: false,
    userData: null,
  })),
  fetchAuthSessionWithRefresh: vi.fn(() => Promise.resolve({
    authenticated: false,
    accessTokenExpiresAt: null,
    hasRefreshToken: false,
    userData: null,
  })),
}));

// Mock next/navigation for MobileNavbar pathname resolution
vi.mock("next/navigation", () => ({
  usePathname: () => "/search/NA",
}));

// Mock vercel analytics/speed-insights to avoid network or runtime errors
vi.mock("@vercel/analytics/next", () => ({
  Analytics: () => <div data-testid="vercel-analytics" />,
}));
vi.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: () => <div data-testid="vercel-speed-insights" />,
}));

describe("season-context date calculations", () => {
  beforeEach(() => {
    __resetPersistentWorkerForTests();
    vi.clearAllMocks();
    vi.mocked(fetchAuthSession).mockResolvedValue({
      authenticated: false,
      accessTokenExpiresAt: null,
      hasRefreshToken: false,
      userData: null,
    });
    vi.mocked(fetchAuthSessionWithRefresh).mockResolvedValue({
      authenticated: false,
      accessTokenExpiresAt: null,
      hasRefreshToken: false,
      userData: null,
    });
    global.Worker = vi.fn(function WorkerMock(this: Worker) {
      this.postMessage = vi.fn();
      this.terminate = vi.fn();
      this.addEventListener = vi.fn();
      this.removeEventListener = vi.fn();
    }) as any;
  });

  it("January date returns winter, past fall (previous year), upcoming spring (current year)", () => {
    const testDate = new Date(2026, 0, 15); // Month is 0-indexed: 0 is January
    const val = getSeasonContextValue(testDate);
    expect(val.current_season).toBe("winter");
    expect(val.current_year).toBe(2026);
    expect(val.past_season).toBe("fall");
    expect(val.past_year).toBe(2025);
    expect(val.upcoming_season).toBe("spring");
    expect(val.upcoming_year).toBe(2026);
  });

  it("March date returns winter", () => {
    const testDate = new Date(2026, 2, 15); // Month is 0-indexed: 2 is March
    const val = getSeasonContextValue(testDate);
    expect(val.current_season).toBe("winter");
    expect(val.current_year).toBe(2026);
  });

  it("April date returns spring, past winter (current year), upcoming summer (current year)", () => {
    const testDate = new Date(2026, 3, 15); // Month is 0-indexed: 3 is April
    const val = getSeasonContextValue(testDate);
    expect(val.current_season).toBe("spring");
    expect(val.current_year).toBe(2026);
    expect(val.past_season).toBe("winter");
    expect(val.past_year).toBe(2026);
    expect(val.upcoming_season).toBe("summer");
    expect(val.upcoming_year).toBe(2026);
  });

  it("June date still returns spring", () => {
    const testDate = new Date(2026, 5, 15); // Month is 0-indexed: 5 is June
    const val = getSeasonContextValue(testDate);
    expect(val.current_season).toBe("spring");
  });

  it("July date returns summer", () => {
    const testDate = new Date(2026, 6, 15); // Month is 0-indexed: 6 is July
    const val = getSeasonContextValue(testDate);
    expect(val.current_season).toBe("summer");
    expect(val.current_year).toBe(2026);
  });

  it("September date still returns summer", () => {
    const testDate = new Date(2026, 8, 15); // Month is 0-indexed: 8 is September
    const val = getSeasonContextValue(testDate);
    expect(val.current_season).toBe("summer");
  });

  it("October date returns fall, past summer (current year), upcoming winter (next year)", () => {
    const testDate = new Date(2026, 9, 15); // Month is 0-indexed: 9 is October
    const val = getSeasonContextValue(testDate);
    expect(val.current_season).toBe("fall");
    expect(val.current_year).toBe(2026);
    expect(val.past_season).toBe("summer");
    expect(val.past_year).toBe(2026);
    expect(val.upcoming_season).toBe("winter");
    expect(val.upcoming_year).toBe(2027);
  });

  it("December date still returns fall, upcoming winter (next year)", () => {
    const testDate = new Date(2026, 11, 15); // Month is 0-indexed: 11 is December
    const val = getSeasonContextValue(testDate);
    expect(val.current_season).toBe("fall");
    expect(val.upcoming_season).toBe("winter");
    expect(val.upcoming_year).toBe(2027);
  });

  it("Invalid dates throw a clear error", () => {
    expect(() => getSeasonContextValue(new Date("invalid-date-string"))).toThrow(
      "Invalid date provided to getSeasonContextValue"
    );
  });

  it("SeasonProvider renders children and supplies context", () => {
    const ConsumerComponent = () => {
      const value = useSeasonContext();
      return <div data-testid="season">{value.current_season}</div>;
    };

    render(
      <SeasonProvider>
        <ConsumerComponent />
      </SeasonProvider>
    );
    expect(screen.getByTestId("season").textContent).toBeDefined();
  });

  it("Providers component renders children in jsdom", () => {
    render(
      <Providers>
        <div data-testid="child">Test Child</div>
      </Providers>
    );
    expect(screen.getByTestId("child").textContent).toBe("Test Child");
  });

  it("Providers keeps the same QueryClient across rerenders", () => {
    const clients: unknown[] = [];
    const QueryClientProbe = () => {
      clients.push(useQueryClient());
      return <div data-testid="query-client-probe" />;
    };

    const { rerender } = render(
      <Providers>
        <QueryClientProbe />
      </Providers>
    );

    rerender(
      <Providers>
        <QueryClientProbe />
      </Providers>
    );

    expect(clients).toHaveLength(2);
    expect(clients[0]).toBe(clients[1]);
  });

  it("PersistentWorker does not start without a valid expiry cookie", () => {
    render(
      <PersistentWorker>
        <div data-testid="worker-child" />
      </PersistentWorker>
    );

    expect(screen.getByTestId("worker-child")).toBeDefined();
    expect(global.Worker).not.toHaveBeenCalled();
  });

  it("PersistentWorker starts once across a Strict-Mode-like remount", async () => {
    vi.mocked(fetchAuthSessionWithRefresh).mockResolvedValue({
      authenticated: true,
      accessTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
      hasRefreshToken: true,
      userData: null,
    });

    const first = render(
      <PersistentWorker>
        <div />
      </PersistentWorker>
    );
    first.unmount();

    render(
      <PersistentWorker>
        <div />
      </PersistentWorker>
    );

    await waitFor(() => {
      expect(global.Worker).toHaveBeenCalledTimes(1);
    });
  });
});
