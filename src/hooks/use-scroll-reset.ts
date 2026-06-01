"use client";

export function isListPage(pathname: string): boolean {
  const path = pathname.replace(/\/$/, "");
  
  if (path === "" || path === "/") {
    return true;
  }

  const segments = path.split("/");

  if (segments[1] === "seasons") {
    return segments.length === 2 || segments.length === 4;
  }

  if (segments[1] === "search") {
    return segments.length === 2 || segments.length === 3;
  }

  const simpleLists = [
    "/mylist",
    "/morethiseseason",
    "/morelastseason",
    "/moreupcoming",
  ];
  return simpleLists.includes(path);
}

export function isPathInFlow(currentList: string, newPathname: string): boolean {
  if (!currentList) return false;

  const listPath = currentList.replace(/\/$/, "");
  const newPath = newPathname.replace(/\/$/, "");

  if (newPath === listPath) return true;

  if (listPath === "" || listPath === "/") {
    return /^\/Anime\/\d+(?:\/relation\/\d+)?(?:\/tracking)?$/i.test(newPath);
  }

  if (listPath.startsWith("/mylist")) {
    return /^\/mylist\/[^/]+\/\d+(?:\/relation\/\d+)?(?:\/tracking)?$/i.test(newPath);
  }

  const escaped = listPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^${escaped}/\\d+(?:/relation/\\d+)?(?:/tracking)?$`, "i");
  return regex.test(newPath);
}

export function useScrollReset() {
  // Obsolete: route-scoped scroll keys inside useScrollSaver handle this natively now.
}
