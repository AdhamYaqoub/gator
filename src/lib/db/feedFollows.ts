import { db } from "./index.js";
import { feedFollows, users, feeds } from "./schema.js";
import { eq, and } from "drizzle-orm";

export async function createFeedFollow(userId: string, feedId: string) {
  const [newFollow] = await db
    .insert(feedFollows)
    .values({ userId, feedId })
    .onConflictDoNothing() 
    .returning();

  const followId = newFollow
  ? newFollow.id
  : (
      await db
        .select({ id: feedFollows.id })
        .from(feedFollows)
        .where(
          and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feedId))
        )
    )[0].id;


  const result = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.id, followId));

  return result[0];
}


export async function getFeedFollowsForUser(userId: string) {
  return await db
    .select({
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId));
}
