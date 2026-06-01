import { afterEach, describe, expect, it, vi } from "vitest";
import {
  readScrollPosition,
  restoreScrollPosition,
  saveScrollPosition,
  SCROLL_STORAGE_KEY,
  getScrollStorageKey,
} from "./use-scroll-saver";

describe("scroll saver helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it("does not throw without window", () => {
    const originalWindow = globalThis.window;
    vi.stubGlobal("window", undefined);

    expect(() => saveScrollPosition()).not.toThrow();
    expect(() => readScrollPosition()).not.toThrow();
    expect(readScrollPosition()).toBeNull();

    vi.stubGlobal("window", originalWindow);
  });

  it("saves and reads valid scroll positions", () => {
    saveScrollPosition(window.sessionStorage, 120);

    expect(window.sessionStorage.getItem(getScrollStorageKey())).toBe("120");
    expect(readScrollPosition(window.sessionStorage)).toBe(120);
  });

  it("rejects invalid stored scroll positions", () => {
    window.sessionStorage.setItem(getScrollStorageKey(), "-1");
    expect(readScrollPosition(window.sessionStorage)).toBeNull();

    window.sessionStorage.setItem(getScrollStorageKey(), "not-a-number");
    expect(readScrollPosition(window.sessionStorage)).toBeNull();
  });

  it("restores only valid positions within the document bounds", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    window.sessionStorage.setItem(getScrollStorageKey(), "20");
    expect(restoreScrollPosition({ storage: window.sessionStorage, maxOffset: 1000 })).toBe(true);
    expect(scrollTo).toHaveBeenCalledWith(0, 20);

    scrollTo.mockClear();
    window.sessionStorage.setItem(getScrollStorageKey(), "999999");
    expect(restoreScrollPosition({ storage: window.sessionStorage, maxOffset: 0 })).toBe(false);
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
