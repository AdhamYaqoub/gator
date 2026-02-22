import { db } from "..";
import { feeds, users } from "../schema";
import { eq } from "drizzle-orm";

export async function getFeedsWithUsers() {
  return await db
    .select({
      feedName: feeds.name,
      url: feeds.url,
      userName: users.name,
    })
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));
}
