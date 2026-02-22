import { getNextFeedToFetch, markFeedFetched } from "./lib/db/queries/feeds";
import { fetchFeed } from "./lib/rss/fetchFeed";
import { createPost } from "./lib/db/queries/posts";

export async function scrapeFeeds() {
  const feed = await getNextFeedToFetch();

  if (!feed) {
    console.log("No feeds found.");
    return;
  }

  console.log(`Fetching feed: ${feed.name}`);

  await markFeedFetched(feed.id);

  const rss = await fetchFeed(feed.url);

  for (const item of rss.channel.item) {
    try {
      const publishedAt = item.pubDate
        ? new Date(item.pubDate)
        : undefined;

      await createPost({
        title: item.title,
        url: item.link,
        description: item.description,
        publishedAt,
        feedId: feed.id,
      });

    } catch (err) {
      console.error("Failed to save post:", item.link);
    }
  }
}
