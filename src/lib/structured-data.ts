import type { MalSeasonItem } from "@/server/seasonal/mal-season-pages";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

const VISIBLE_LIST_ITEM_LIMIT = 30;

export function stringifyJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function createAnimeBreadcrumbJsonLd(input: {
  title: string;
  malId: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: SITE_NAME,
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Anime",
        item: absoluteUrl("/search/NA"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: input.title,
        item: absoluteUrl(`/Anime/${input.malId}`),
      },
    ],
  };
}

export function createSeasonItemListJsonLd(input: {
  name: string;
  path: string;
  items: MalSeasonItem[];
  detailHrefPrefix: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    url: absoluteUrl(input.path),
    numberOfItems: Math.min(input.items.length, VISIBLE_LIST_ITEM_LIMIT),
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: input.items
      .slice(0, VISIBLE_LIST_ITEM_LIMIT)
      .map((item, index) => {
        const node = item.node;
        const title =
          node.alternative_titles?.en || node.title || `Anime #${node.id}`;
        const image = node.main_picture?.large || node.main_picture?.medium;

        return {
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(`/Anime/${node.id}`),
          item: {
            "@type": node.num_episodes === 1 ? "Movie" : "TVSeries",
            name: title,
            url: absoluteUrl(`/Anime/${node.id}`),
            image: image ? absoluteUrl(image) : undefined,
          },
        };
      }),
  };
}
