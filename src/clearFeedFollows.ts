import { db } from "./lib/db/index.js";
import { feedFollows } from "./lib/db/schema.js";

async function clearFeedFollows() {
  await db.delete(feedFollows).execute();
  console.log("feed_follows table cleared!");
}

clearFeedFollows().then(() => process.exit());