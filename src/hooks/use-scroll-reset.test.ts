import { describe, expect, it } from "vitest";
import { isListPage, isPathInFlow } from "./use-scroll-reset";

describe("useScrollReset helpers", () => {
  describe("isListPage", () => {
    it("identifies list pages correctly", () => {
      expect(isListPage("/")).toBe(true);
      expect(isListPage("/mylist")).toBe(true);
      expect(isListPage("/seasons")).toBe(true);
      expect(isListPage("/seasons/summer/2024")).toBe(true);
      expect(isListPage("/search")).toBe(true);
      expect(isListPage("/search/naruto")).toBe(true);
      expect(isListPage("/morethiseseason")).toBe(true);
      expect(isListPage("/morelastseason")).toBe(true);
      expect(isListPage("/moreupcoming")).toBe(true);
    });

    it("identifies non-list pages correctly", () => {
      expect(isListPage("/Anime/12345")).toBe(false);
      expect(isListPage("/seasons/summer/2024/12345")).toBe(false);
      expect(isListPage("/mylist/Watching/12345")).toBe(false);
      expect(isListPage("/mylist/user_profile")).toBe(false);
      expect(isListPage("/morethiseseason/12345")).toBe(false);
    });
  });

  describe("isPathInFlow", () => {
    it("matches pages in the same list flow", () => {
      // MyList flow
      expect(isPathInFlow("/mylist", "/mylist/Watching/123")).toBe(true);
      expect(isPathInFlow("/mylist", "/mylist/Watching/123/relation/456")).toBe(true);
      expect(isPathInFlow("/mylist", "/mylist/Watching/123/tracking")).toBe(true);
      expect(isPathInFlow("/mylist", "/mylist/Watching/123/relation/456/tracking")).toBe(true);

      // Seasons flow
      expect(isPathInFlow("/seasons/summer/2024", "/seasons/summer/2024/123")).toBe(true);
      expect(isPathInFlow("/seasons/summer/2024", "/seasons/summer/2024/123/relation/456")).toBe(true);

      // Home flow
      expect(isPathInFlow("/", "/Anime/123")).toBe(true);
      expect(isPathInFlow("/", "/Anime/123/relation/456")).toBe(true);

      // Search flow
      expect(isPathInFlow("/search/naruto", "/search/naruto/123")).toBe(true);
      expect(isPathInFlow("/search/naruto", "/search/naruto/123/relation/456")).toBe(true);
    });

    it("does not match pages in different flows", () => {
      expect(isPathInFlow("/mylist", "/morethiseseason/123")).toBe(false);
      expect(isPathInFlow("/seasons/summer/2024", "/mylist/Watching/123")).toBe(false);
      expect(isPathInFlow("/", "/mylist")).toBe(false);
    });
  });
});
