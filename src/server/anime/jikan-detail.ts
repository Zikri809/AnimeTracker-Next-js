function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchJikanDetailRaw(targetAnimeId: number): Promise<any> {
  if (process.env.PLAYWRIGHT_TEST === 'true') {
    if (targetAnimeId === 1) {
      return {
        mal_id: 1,
        title: "Cowboy Bebop",
        title_english: "Cowboy Bebop English",
        title_japanese: "カウボーイビバップ",
        title_synonyms: ["COWBOY BEBOP"],
        images: {
          webp: {
            large_image_url: "https://example.com/cowboy.webp"
          }
        },
        status: "Finished Airing",
        episodes: 26,
        score: 8.78,
        scored_by: 915000,
        popularity: 39,
        favorites: 78000,
        synopsis: "This is a detailed mock synopsis for Cowboy Bebop.",
        genres: [
          { mal_id: 1, name: "Action" },
          { mal_id: 2, name: "Sci-Fi" }
        ],
        trailer: {
          embed_url: "https://www.youtube.com/embed/gY5nDXOtv_o"
        },
        duration: "24 min per ep",
        broadcast: {
          day: "Saturdays",
          time: "16:00",
          timezone: "Asia/Tokyo"
        },
        season: "spring",
        year: 1998,
        studios: [{ mal_id: 14, name: "Sunrise" }],
        licensors: [{ mal_id: 102, name: "Funimation" }]
      };
    }
    if (targetAnimeId === 2) {
      return {
        mal_id: 2,
        title: "Upcoming Show",
        status: "Not Yet Aired",
        episodes: 12,
        genres: [],
        studios: [],
        licensors: []
      };
    }
    if (targetAnimeId === 3) {
      return {
        mal_id: 3,
        title: "Airing Show",
        status: "Currently Airing",
        episodes: 12,
        genres: [],
        studios: [],
        licensors: []
      };
    }
    if (targetAnimeId === 5) {
      return {
        mal_id: 5,
        title: "Cowboy Bebop: Tengoku no Tobira",
        title_english: "Cowboy Bebop: The Movie",
        images: {
          webp: {
            large_image_url: "https://example.com/movie.webp"
          }
        },
        status: "Finished Airing",
        episodes: 1,
        score: 8.39,
        synopsis: "Relation movie synopsis.",
        genres: [{ mal_id: 1, name: "Action" }],
        studios: [{ mal_id: 14, name: "Sunrise" }],
        licensors: []
      };
    }
    if (targetAnimeId === 999) {
      throw new Error("HTTP 500");
    }
  }

  let retries = 0;
  const maxRetries = 3; // initial attempt + 3 retries = 4 total attempts
  const delay = 1000;

  while (true) {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime/${targetAnimeId}/full`, {
        next: { revalidate: 60 }, // Cache for 60 seconds to prevent rate limiting (429)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      if (!json || !json.data || json.data.mal_id !== targetAnimeId) {
        throw new Error("Invalid Jikan response or mal_id mismatch");
      }

      return json.data;
    } catch (error) {
      if (retries < maxRetries) {
        retries++;
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
}

export async function fetchJikanRelations(targetAnimeId: number, fullDetailData: any): Promise<any[]> {
  if (process.env.PLAYWRIGHT_TEST === 'true' && targetAnimeId === 1) {
    return [
      {
        relation: "Side Story",
        entry: [
          {
            mal_id: 5,
            type: "anime",
            name: "Cowboy Bebop: Tengoku no Tobira"
          }
        ]
      }
    ];
  }

  if (fullDetailData && Array.isArray(fullDetailData.relations)) {
    return fullDetailData.relations;
  }

  let retries = 0;
  const maxRetries = 3;
  const delay = 1000;

  while (true) {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime/${targetAnimeId}/relations`, {
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      if (!json || !Array.isArray(json.data)) {
        throw new Error("Invalid relations response");
      }

      return json.data;
    } catch (error) {
      if (retries < maxRetries) {
        retries++;
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
}
