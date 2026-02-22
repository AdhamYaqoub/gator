import { XMLParser } from "fast-xml-parser";

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  // 1) fetch xml
  const res = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator",
    },
  });

  if (!res.ok) {
    throw new Error("failed to fetch feed");
  }

  const xml = await res.text();

  // 2) parse xml
  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  const data = parser.parse(xml);

  if (!data?.rss?.channel) {
    throw new Error("invalid rss format");
  }

  const channel = data.rss.channel;

  // 3) validate channel metadata
  if (!channel.title || !channel.link || !channel.description) {
    throw new Error("missing channel fields");
  }

  // 4) extract items
  let rawItems = [];
  if (Array.isArray(channel.item)) rawItems = channel.item;
  else if (channel.item) rawItems = [channel.item];

  const items: RSSItem[] = [];

  for (const item of rawItems) {
    if (!item.title || !item.link || !item.description || !item.pubDate) {
      continue;
    }

    items.push({
      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate,
    });
  }

  return {
    channel: {
      title: channel.title,
      link: channel.link,
      description: channel.description,
      item: items,
    },
  };
}
