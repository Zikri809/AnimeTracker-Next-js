import { afterEach, describe, expect, it, vi } from 'vitest';
import { normalizeMalDetail } from './anime-detail-normalize';

describe('MAL Detail Normalize Helper', () => {
  it('normalizes a full MAL detail payload into the detail view model', () => {
    const rawData = {
      id: 1,
      title: "Cowboy Bebop",
      alternative_titles: {
        en: "Cowboy Bebop English",
        ja: "カウボーイビバップ",
        synonyms: ["COWBOY BEBOP"],
      },
      main_picture: { large: "http://large.webp", medium: "http://medium.webp" },
      status: "finished_airing",
      start_season: { season: "spring", year: 1998 },
      start_date: "1998-04-03",
      end_date: "1999-04-24",
      num_episodes: 26,
      mean: 8.78,
      num_scoring_users: 915000,
      rank: 30,
      popularity: 35,
      genres: [
        { id: 1, name: "Action" },
        { id: 2, name: "Sci-Fi" },
      ],
      synopsis: "A synopsis here.",
      source: "original",
      studios: [{ id: 14, name: "Sunrise" }],
      rating: "r_17",
      broadcast: { day_of_week: "saturday", start_time: "01:00" },
      average_episode_duration: 1440,
      related_anime: [
        {
          relation: "adaptation",
          entry: [{ id: 10, name: "Manga", type: "manga" }],
        },
        {
          relation: "side_story",
          entry: [{ id: 5, name: "Cowboy Bebop: The Movie", type: "anime" }],
        },
      ],
    };

    const vm = normalizeMalDetail(rawData, {
      bannerImageUrl: "http://banner.webp",
      trailerEmbedUrl: "https://www.youtube.com/embed/gY5nDXOtv_o",
    });

    expect(vm.malId).toBe(1);
    expect(vm.title).toBe("Cowboy Bebop");
    expect(vm.englishTitle).toBe("Cowboy Bebop English");
    expect(vm.displayTitle).toBe("Cowboy Bebop English");
    expect(vm.imageUrl).toBe("http://large.webp");
    expect(vm.bannerImageUrl).toBe("http://banner.webp");
    expect(vm.status).toBe("Finished Airing");
    expect(vm.statusLabel).toBe("Finished Airing");
    expect(vm.season).toBe("spring");
    expect(vm.year).toBe(1998);
    expect(vm.seasonLabel).toBe("Spring 1998");
    expect(vm.episodes).toBe(26);
    expect(vm.score).toBe(8.78);
    expect(vm.scoredBy).toBe(915000);
    expect(vm.rank).toBe(30);
    expect(vm.popularity).toBe(35);
    expect(vm.favorites).toBeNull();
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
    expect(vm.trailerEmbedUrl).toBe(
      "https://www.youtube.com/embed/gY5nDXOtv_o?autoplay=0&mute=0",
    );
    expect(vm.licensors).toEqual([]);
    expect(vm.duration).toBe("24 min");
    expect(vm.relations).toEqual([
      {
        relation: "Adaptation",
        entries: [{ malId: 10, name: "Manga", type: "manga" }],
      },
      {
        relation: "Side Story",
        entries: [
          { malId: 5, name: "Cowboy Bebop: The Movie", type: "anime" },
        ],
      },
    ]);
  });

  it('falls back to romaji title and trims unsafe relation entries', () => {
    const vm = normalizeMalDetail({
      id: 7,
      title: "No English Title",
      status: "currently_airing",
    });

    expect(vm.englishTitle).toBeNull();
    expect(vm.displayTitle).toBe("No English Title");
    expect(vm.statusLabel).toBe("Currently Airing");
    expect(vm.relations).toEqual([]);
  });

  it('maps MAL status enums to UI display strings', () => {
    expect(normalizeMalDetail({ id: 1, status: "not_yet_aired" }).status).toBe("Not Yet Aired");
    expect(normalizeMalDetail({ id: 1, status: "currently_airing" }).status).toBe("Currently Airing");
    expect(normalizeMalDetail({ id: 1, status: "on_hiatus" }).status).toBe("on_hiatus");
    expect(normalizeMalDetail({ id: 1 }).status).toBeNull();
    expect(normalizeMalDetail({ id: 1 }).statusLabel).toBe("Unknown");
  });

  it('formats hour-plus durations and keeps sub-minute durations null-safe', () => {
    expect(normalizeMalDetail({ id: 1, average_episode_duration: 1800 }).duration).toBe("30 min");
    expect(normalizeMalDetail({ id: 1, average_episode_duration: 5460 }).duration).toBe("1 hr 31 min");
    expect(normalizeMalDetail({ id: 1, average_episode_duration: 5400 }).duration).toBe("1 hr 30 min");
    expect(normalizeMalDetail({ id: 1, average_episode_duration: 7200 }).duration).toBe("2 hr");
    expect(normalizeMalDetail({ id: 1, average_episode_duration: 0 }).duration).toBeNull();
    expect(normalizeMalDetail({ id: 1 }).duration).toBeNull();
  });

  it('formats aired windows from ISO dates without timezone day shifts', () => {
    expect(
      normalizeMalDetail({ id: 1, start_date: "2015-07-01" }).airedLabel,
    ).toBe("Jul 1, 2015");
    expect(
      normalizeMalDetail({ id: 1, start_date: "1998-04-03", end_date: "1999-04-24" }).airedLabel,
    ).toBe("Apr 3, 1998 to Apr 24, 1999");
    expect(normalizeMalDetail({ id: 1, start_date: "garbage" }).airedLabel).toBeNull();
    expect(normalizeMalDetail({ id: 1 }).airedLabel).toBeNull();
  });

  it('normalizes unknown broadcast data to null instead of empty labels', () => {
    expect(
      normalizeMalDetail({
        id: 1,
        broadcast: { day_of_week: "friday", start_time: "23:30" },
      }).broadcast,
    ).toEqual({
      day: "Fridays",
      time: "23:30",
      timezone: "Asia/Tokyo",
      label: "Fridays at 23:30 (JST)",
    });
    expect(normalizeMalDetail({ id: 1, broadcast: {} }).broadcast).toBeNull();
    expect(normalizeMalDetail({ id: 1 }).broadcast).toBeNull();
  });

  it('sanitizes trailer embed URLs passed via extras', () => {
    expect(
      normalizeMalDetail({ id: 1 }, { trailerEmbedUrl: "javascript:alert(1)" })
        .trailerEmbedUrl,
    ).toBeNull();
    expect(
      normalizeMalDetail({ id: 1 }, { trailerEmbedUrl: "not a url" })
        .trailerEmbedUrl,
    ).toBeNull();
    expect(
      normalizeMalDetail({ id: 1 }).trailerEmbedUrl,
    ).toBeNull();
  });
});
