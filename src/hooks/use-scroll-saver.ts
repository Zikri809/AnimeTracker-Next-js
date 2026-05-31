"use client";

import { useEffect, useRef } from "react";
import type { DependencyList } from "react";

export const SCROLL_STORAGE_KEY = "scrollY";

function getSessionStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

export function saveScrollPosition(storage?: Storage, y?: number): void {
  const targetStorage = storage ?? getSessionStorage();
  if (typeof window === "undefined" || !targetStorage) return;
  try {
    const scrollY = y !== undefined ? y : window.scrollY;
    targetStorage.setItem(SCROLL_STORAGE_KEY, String(scrollY));
  } catch (e) {
    console.error("Failed to save scroll position", e);
  }
}

export function readScrollPosition(storage?: Storage): number | null {
  const targetStorage = storage ?? getSessionStorage();
  if (typeof window === "undefined" || !targetStorage) return null;
  try {
    const val = targetStorage.getItem(SCROLL_STORAGE_KEY);
    if (val === null) return null;
    const num = Number(val);
    if (Number.isFinite(num) && num >= 0) {
      return num;
    }
  } catch (e) {
    console.error("Failed to read scroll position", e);
  }
  return null;
}

export function restoreScrollPosition(options?: { maxOffset?: number; storage?: Storage }): boolean {
  if (typeof window === "undefined") return false;
  const storage = options?.storage ?? getSessionStorage();
  if (!storage) return false;
  const maxOffset = options?.maxOffset ?? 100;

  const savedY = readScrollPosition(storage);
  if (savedY === null) return false;

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight + maxOffset;
  if (savedY <= maxScroll) {
    window.scrollTo(0, savedY);
    return true;
  }
  return false;
}

export function useScrollSaver(deps: DependencyList = []): void {
  const isRestored = useRef(false);
  void deps;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleSave = () => {
      saveScrollPosition();
    };

    const handleUserInteraction = () => {
      isRestored.current = true;
    };

    window.addEventListener("pagehide", handleSave);
    window.addEventListener("beforeunload", handleSave);
    window.addEventListener("wheel", handleUserInteraction, { passive: true });
    window.addEventListener("touchmove", handleUserInteraction, { passive: true });

    const handleLinkClick = (e: MouseEvent) => {
      let target = e.target as HTMLElement | null;
      while (target && target !== document.body) {
        if (target.tagName === "A") {
          const href = target.getAttribute("href");
          if (href && (href.startsWith("/") || href.startsWith(window.location.origin))) {
            saveScrollPosition();
          }
          break;
        }
        target = target.parentElement;
      }
    };

    document.addEventListener("click", handleLinkClick, { capture: true });

    return () => {
      window.removeEventListener("pagehide", handleSave);
      window.removeEventListener("beforeunload", handleSave);
      window.removeEventListener("wheel", handleUserInteraction);
      window.removeEventListener("touchmove", handleUserInteraction);
      document.removeEventListener("click", handleLinkClick, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (!isRestored.current) {
      const restored = restoreScrollPosition();
      if (restored) {
        isRestored.current = true;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
