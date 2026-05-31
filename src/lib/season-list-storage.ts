export function parseWatchlistMap(key: string): Map<number, unknown> {
  if (typeof window === "undefined") {
    return new Map();
  }
  try {
    const value = localStorage.getItem(key);
    if (!value) {
      return new Map();
    }
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return new Map();
    }
    const validPairs: Array<[number, unknown]> = [];
    for (const item of parsed) {
      if (Array.isArray(item) && item.length >= 2) {
        const id = Number(item[0]);
        if (Number.isFinite(id)) {
          validPairs.push([id, item[1]]);
        }
      }
    }
    return new Map(validPairs);
  } catch (error) {
    console.error(`Error parsing watchlist map for ${key}:`, error);
    return new Map();
  }
}

export function getRouteScopedKey(pathname: string | null, key: string): string {
  return `season-list:${pathname || ""}:${key}`;
}

export function readRouteScopedSlice(pathname: string | null): number | null {
  if (typeof window === "undefined" || !pathname) return null;
  const value = sessionStorage.getItem(getRouteScopedKey(pathname, "slicearr"));
  if (!value) return null;
  try {
    const parsed = Number(JSON.parse(value));
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 10000) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeRouteScopedSlice(pathname: string | null, slice: number): void {
  if (typeof window === "undefined" || !pathname) return;
  sessionStorage.setItem(getRouteScopedKey(pathname, "slicearr"), JSON.stringify(slice));
}

export function readRouteScopedSortType(pathname: string | null): string | null {
  if (typeof window === "undefined" || !pathname) return null;
  const value = sessionStorage.getItem(getRouteScopedKey(pathname, "sort_type"));
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function writeRouteScopedSortType(pathname: string | null, sortType: string): void {
  if (typeof window === "undefined" || !pathname) return;
  sessionStorage.setItem(getRouteScopedKey(pathname, "sort_type"), JSON.stringify(sortType));
}

export function readRouteScopedSortedAnime<T extends { node?: { id?: number } }>(
  pathname: string | null,
  initialItems: T[]
): T[] | null {
  if (typeof window === "undefined" || !pathname) return null;

  const scopedKey = getRouteScopedKey(pathname, "sorted_anime");
  const scopedValue = sessionStorage.getItem(scopedKey);
  if (scopedValue) {
    try {
      const parsed = JSON.parse(scopedValue);
      if (isValidStoredList(parsed, initialItems)) return parsed;
      sessionStorage.removeItem(scopedKey);
    } catch {
      sessionStorage.removeItem(scopedKey);
    }
  }

  const legacyValue = sessionStorage.getItem("sorted_anime");
  if (legacyValue) {
    try {
      const parsed = JSON.parse(legacyValue);
      if (isValidStoredList(parsed, initialItems)) {
        sessionStorage.setItem(scopedKey, legacyValue);

        const legacySortType = sessionStorage.getItem("sort_type");
        if (legacySortType) {
          sessionStorage.setItem(getRouteScopedKey(pathname, "sort_type"), legacySortType);
        }

        const legacySlice = sessionStorage.getItem("slicearr");
        if (legacySlice) {
          sessionStorage.setItem(getRouteScopedKey(pathname, "slicearr"), legacySlice);
        }

        clearLegacyGlobalKeys();
        return parsed;
      }
    } catch {
      // Ignore malformed legacy values and clear them below.
    }
  }

  clearLegacyGlobalKeys();
  return null;
}

export function writeRouteScopedSortedAnime<T>(pathname: string | null, items: T[]): void {
  if (typeof window === "undefined" || !pathname) return;
  sessionStorage.setItem(getRouteScopedKey(pathname, "sorted_anime"), JSON.stringify(items));
}

export function clearLegacyGlobalKeys(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("sorted_anime");
  sessionStorage.removeItem("sort_type");
  sessionStorage.removeItem("slicearr");
}

function isValidStoredList<T extends { node?: { id?: number } }>(
  value: unknown,
  initialItems: T[]
): value is T[] {
  if (!Array.isArray(value)) return false;
  const initialIds = new Set(initialItems.map((item) => item?.node?.id).filter((id): id is number => typeof id === "number"));
  return value.every((item) => {
    const id = item?.node?.id;
    return typeof id === "number" && initialIds.has(id);
  });
}
