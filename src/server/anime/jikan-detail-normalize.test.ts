import { describe, it, expect } from "vitest";
import { normalizeJikanDetail } from "./jikan-detail-normalize";

describe("Jikan Detail Normalize Helper", () => {
  it("should normalize full detail correctly", () => {
    const rawData = {
      mal_id: 1,
      title: "Cowboy Bebop",
      title_english: "Cowboy Bebop English",
      images: {
        webp: {
          large_image_url: "http://large.webp",
        },
      },
      status: "Finished Airing",
      season: "spring",
      year: 1998,
      episodes: 26,
      score: 8.78,
      scored_by: 123456,
      rank: 30,
      popularity: 35,
      favorites: 75000,
      genres: [
        { mal_id: 1, name: "Action" },
        { mal_id: 2, name: "Sci-Fi" },
      ],
      synopsis: "A synopsis here.",
      source: "Original",
      studios: [{ name: "Sunrise" }],
      rating: "R - 17+ (violence & profanity)",
      aired: { string: "Apr 3, 1998 to Apr 24, 1999" },
      broadcast: {
        day: "Saturdays",
        time: "01:00",
        timezone: "Asia/Tokyo",
        string: "Saturdays at 01:00 (JST)",
      },
      trailer: {
        embed_url: "https://www.youtube.com/embed/gY5nDXOtv_o?enablejsapi=1",
      },
      licensors: [{ name: "Funimation" }],
      duration: "24 min per ep",
      relations: [
        {
          relation: "Adaptation",
          entry: [{ mal_id: 10, name: "Manga", type: "manga" }],
        },
      ],
    };

    const vm = normalizeJikanDetail(rawData);
    expect(vm.malId).toBe(1);
    expect(vm.title).toBe("Cowboy Bebop");
    expect(vm.englishTitle).toBe("Cowboy Bebop English");
    expect(vm.displayTitle).toBe("Cowboy Bebop English");
    expect(vm.imageUrl).toBe("http://large.webp");
    expect(vm.status).toBe("Finished Airing");
    expect(vm.statusLabel).toBe("Finished Airing");
    expect(vm.season).toBe("spring");
    expect(vm.year).toBe(1998);
    expect(vm.seasonLabel).toBe("Spring 1998");
    expect(vm.episodes).toBe(26);
    expect(vm.score).toBe(8.78);
    expect(vm.scoredBy).toBe(123456);
    expect(vm.rank).toBe(30);
    expect(vm.popularity).toBe(35);
    expect(vm.favorites).toBe(75000);
    expect(vm.genres).toEqual([
      { id: 1, name: "Action" },
      { id: 2, name: "Sci-Fi" },
    ]);
    expect(vm.synopsis).toBe("A synopsis here.");
    expect(vm.source).toBe("Original");
    expect(vm.studios).toEqual(["Sunrise"]);
    expect(vm.rating).toBe("R - 17+ (violence & profanity)");
    expect(vm.airedLabel).toBe("Apr 3, 1998 to Apr 24, 1999");
    expect(vm.broadcast).toEqual({
      day: "Saturdays",
      time: "01:00",
      timezone: "Asia/Tokyo",
      label: "Saturdays at 01:00 (JST)",
    });
    expect(vm.trailerEmbedUrl).toContain("autoplay=0");
    expect(vm.licensors).toEqual(["Funimation"]);
    expect(vm.duration).toBe("24 min per ep");
    expect(vm.relations).toEqual([
      {
        relation: "Adaptation",
        entries: [{ malId: 10, name: "Manga", type: "manga" }],
      },
    ]);
  });

  it("should fall back english title to default title to Anime #id", () => {
    const vm1 = normalizeJikanDetail({
      mal_id: 1,
      title: "Bebop",
      title_english: null,
    });
    expect(vm1.displayTitle).toBe("Bebop");

    const vm2 = normalizeJikanDetail({
      mal_id: 1,
      title: null,
      title_english: null,
    });
    expect(vm2.displayTitle).toBe("Anime #1");
  });

  it("should fall back images properly", () => {
    const vm1 = normalizeJikanDetail({
      mal_id: 1,
      images: {
        jpg: { large_image_url: "http://large.jpg" },
      },
    });
    expect(vm1.imageUrl).toBe("http://large.jpg");

    const vm2 = normalizeJikanDetail({
      mal_id: 1,
      images: {
        webp: { image_url: "http://medium.webp" },
      },
    });
    expect(vm2.imageUrl).toBe("http://medium.webp");

    const vm3 = normalizeJikanDetail({ mal_id: 1 });
    expect(vm3.imageUrl).toBeNull();
  });

  it("should not throw on missing fields", () => {
    const vm = normalizeJikanDetail({ mal_id: 2 });
    expect(vm.malId).toBe(2);
    expect(vm.title).toBe("");
    expect(vm.englishTitle).toBeNull();
    expect(vm.displayTitle).toBe("Anime #2");
    expect(vm.imageUrl).toBeNull();
    expect(vm.status).toBeNull();
    expect(vm.statusLabel).toBe("Unknown");
    expect(vm.season).toBeNull();
    expect(vm.year).toBeNull();
    expect(vm.seasonLabel).toBeNull();
    expect(vm.episodes).toBeNull();
    expect(vm.score).toBeNull();
    expect(vm.scoredBy).toBeNull();
    expect(vm.rank).toBeNull();
    expect(vm.popularity).toBeNull();
    expect(vm.favorites).toBeNull();
    expect(vm.genres).toEqual([]);
    expect(vm.synopsis).toBeNull();
    expect(vm.source).toBeNull();
    expect(vm.studios).toEqual([]);
    expect(vm.rating).toBeNull();
    expect(vm.airedLabel).toBeNull();
    expect(vm.broadcast).toBeNull();
    expect(vm.trailerEmbedUrl).toBeNull();
    expect(vm.licensors).toEqual([]);
    expect(vm.duration).toBeNull();
    expect(vm.relations).toEqual([]);
  });

  it("should ignore unsupported season values to avoid broken archive links", () => {
    const vm = normalizeJikanDetail({
      mal_id: 1,
      season: "monsoon",
      year: 2026,
    });

    expect(vm.season).toBeNull();
    expect(vm.year).toBe(2026);
    expect(vm.seasonLabel).toBeNull();
  });

  it("should format trailer URL without breaking autoplay values", () => {
    const vm1 = normalizeJikanDetail({
      mal_id: 1,
      trailer: { embed_url: "https://youtube.com/embed/123?autoplay=1" },
    });
    expect(vm1.trailerEmbedUrl).toBe(
      "https://youtube.com/embed/123?autoplay=0&mute=0",
    );

    const vm2 = normalizeJikanDetail({
      mal_id: 1,
      trailer: { embed_url: "https://youtube.com/embed/123" },
    });
    expect(vm2.trailerEmbedUrl).toBe(
      "https://youtube.com/embed/123?autoplay=0&mute=0",
    );
  });

  it("should drop unsafe trailer URLs and malformed relation entries", () => {
    const vm = normalizeJikanDetail({
      mal_id: 1,
      trailer: { embed_url: "javascript:alert(1)" },
      relations: [
        {
          relation: "Side Story",
          entry: [
            { mal_id: 5, name: "Valid Relation", type: "anime" },
            { mal_id: 0, name: "Invalid Relation", type: "anime" },
            { name: "Missing ID", type: "anime" },
          ],
        },
      ],
    });

    expect(vm.trailerEmbedUrl).toBeNull();
    expect(vm.relations[0].entries).toEqual([
      { malId: 5, name: "Valid Relation", type: "anime" },
    ]);
  });

  it("should preserve relation entry types for anime and non-anime internal links", () => {
    const vm = normalizeJikanDetail({
      mal_id: 1,
      relations: [
        {
          relation: "Sequel",
          entry: [
            { mal_id: 2, name: "Anime Sequel", type: "anime" },
            { mal_id: 10, name: "Manga Adaptation", type: "manga" },
            { mal_id: 11 },
          ],
        },
      ],
    });

    expect(vm.relations[0].entries).toEqual([
      { malId: 2, name: "Anime Sequel", type: "anime" },
      { malId: 10, name: "Manga Adaptation", type: "manga" },
      { malId: 11, name: "Anime #11", type: null },
    ]);
  });
});
