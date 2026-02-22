import { db } from "..";
import { posts, feeds, feedFollows } from "../schema";
import { desc, eq, ilike, asc, and , or  } from "drizzle-orm";

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


export async function getPostsForUser(
  userId: string,
  limit: number = 2,
  page: number = 1,
  sortBy: "publishedAt" | "title" | "feedName" = "publishedAt",
  filter?: string
) {
  const limitNum = limit;
  const pageNum = page > 0 ? page : 1;
  const offset = (pageNum - 1) * limitNum;

  const orderColumn =
    sortBy === "title"
      ? posts.title
      : sortBy === "feedName"
      ? feeds.name
      : posts.publishedAt;

  const orderDir = sortBy === "publishedAt" ? desc(orderColumn) : asc(orderColumn);

  return await db
  .select({
    id: posts.id,
    title: posts.title,
    url: posts.url,
    description: posts.description,
    publishedAt: posts.publishedAt,
    feedName: feeds.name,
  })
  .from(posts)
  .innerJoin(feeds, eq(posts.feedId, feeds.id))
  .where(
    filter
      ? or(
          ilike(posts.title, `%${filter}%`),
          ilike(feeds.name, `%${filter}%`)
        )
      : undefined
  )
  .limit(limitNum)
  .offset(offset)
  .orderBy(orderDir);

}