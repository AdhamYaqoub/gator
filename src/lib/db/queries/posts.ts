import { db } from "..";
import { posts, feeds, feedFollows } from "../schema";
import { desc, eq } from "drizzle-orm";

export async function createPost(data: {
  title: string;
  url: string;
  description?: string;
  publishedAt?: Date;
  feedId: string;
}) {
  try {
    const [post] = await db
      .insert(posts)
      .values(data)
      .returning();

    return post;
  } catch (err) {
    return null;
  }
}


export async function getPostsForUser(userId: string, limit: number) {
  return await db
    .select({
      title: posts.title,
      url: posts.url,
      publishedAt: posts.publishedAt,
      feedName: feeds.name,
    })
    .from(posts)
    .innerJoin(feeds, eq(posts.feedId, feeds.id))
    .innerJoin(feedFollows, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
}