import { db } from "..";
import { feedFollows, feeds, users } from "../schema";
import { and, eq, asc   } from "drizzle-orm";

export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db.insert(feeds).values({ name, url, userId }).returning();
  return result;
}

export async function getFeedByUrl(url: string) {
  const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
  return result;
}

export async function createFeedFollow(userId: string, feedId: string) {
  const [newFollow] = await db.insert(feedFollows).values({ userId, feedId }).returning();

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
    .where(eq(feedFollows.id, newFollow.id));

  return result[0];
}

export async function getFeedFollowsForUser(userId: string) {
  return db
    .select({
      feedId: feeds.id,       
      feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId));
}


export async function deleteFeedFollowByUrl(userId: string, url: string) {
  const feed = await db.query.feeds.findFirst({
    where: (f, { eq }) => eq(f.url, url),
  });

  if (!feed) {
    throw new Error("Feed not found");
  }

  const deleted = await db
    .delete(feedFollows)
    .where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feed.id)))
    .returning();

  if (deleted.length === 0) {
    throw new Error("You are not following this feed");
  }

  return feed;
}

export async function markFeedFetched(feedId: string) {
  await db
    .update(feeds)
    .set({
      lastFetchedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(feeds.id, feedId));
}

export async function getNextFeedToFetch() {
  const result = await db
    .select()
    .from(feeds)
    .orderBy(asc(feeds.lastFetchedAt))
    .limit(1);

  return result[0];
}