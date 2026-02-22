import { setUser } from "./config.js";
import { createUser, getUserByName, getCurrentUser, getUsers } from "./lib/db/queries/users.js";
import { resetUsers } from "./lib/db/queries/reset.js";
import { readConfig } from "./config.js";
import { fetchFeed } from "./lib/rss/fetchFeed.js";
import { feeds } from "./lib/db/schema.js";
import { createFeed, getFeedByUrl, createFeedFollow, getFeedFollowsForUser,deleteFeedFollowByUrl  } from "./lib/db/queries/feeds.js";
import { getFeedsWithUsers } from "./lib/db/queries/feeds_list.js";
import { User } from "./lib/db/schema";
import { scrapeFeeds } from "./aggregator";
import { parseDuration } from "./utils.js";
import { getPostsForUser } from "./lib/db/queries/posts.js";


type Feed = typeof feeds.$inferSelect;

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

export function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler
) {
  registry[cmdName] = handler;
}

export async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
) {
  const handler = registry[cmdName];

  if (!handler) {
    throw new Error(`Unknown command: ${cmdName}`);
  }

  await handler(cmdName, ...args);
}

export async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw new Error("username required");
  }

  const username = args[0];

  const user = await getUserByName(username);
  if (!user) {
    throw new Error("user does not exist");
  }

  setUser(username);
  console.log(`User set to ${username}`);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw new Error("username required");
  }

  const username = args[0];

  const existing = await getUserByName(username);
  if (existing) {
    throw new Error("user already exists");
  }

  const user = await createUser(username);

  setUser(username);
  console.log("User created:");
  console.log(user);
}

export async function handlerReset(cmdName: string, ...args: string[]) {
  try {
    await resetUsers();
    console.log("Database reset successful");
  } catch (err) {
    throw new Error("Failed to reset database");
  }
}

export async function handlerUsers(cmdName: string, ...args: string[]) {
  const allUsers = await getUsers();
  const config = readConfig();

  for (const user of allUsers) {
    if (user.name === config.currentUserName) {
      console.log(`* ${user.name} (current)`);
    } else {
      console.log(`* ${user.name}`);
    }
  }
}

export async function handlerAgg(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw new Error("usage: agg <time_between_reqs>");
  }

  const durationStr = args[0];
  const timeBetweenRequests = parseDuration(durationStr);

  console.log(`Collecting feeds every ${durationStr}`);

  const handleError = (err: any) => {
    console.error("Error:", err.message || err);
  };

  await scrapeFeeds().catch(handleError);

  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("\nShutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}


export function printFeed(feed: Feed, user: any) {
  console.log(`Feed added:`);
  console.log(`ID: ${feed.id}`);
  console.log(`Name: ${feed.name}`);
  console.log(`URL: ${feed.url}`);
  console.log(`User: ${user.name}`);
}

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]) {
  if (args.length < 2) {
    throw new Error("usage: addfeed <name> <url>");
  }

  const [name, url] = args;

  const existingFeed = await getFeedByUrl(url);
  
  let feed = existingFeed;
  if (!feed) {
    feed = await createFeed(name, url, user.id);
  }

  const follow = await createFeedFollow(user.id, feed.id);

  printFeed(feed, user);
}


export async function handlerFeeds() {
  const feeds = await getFeedsWithUsers();

  for (const feed of feeds) {
    console.log(`Name: ${feed.feedName}`);
    console.log(`URL: ${feed.url}`);
    console.log(`User: ${feed.userName}`);
    console.log("");
  }
}

export async function handlerFollow(cmdName: string, user: User, url: string) {
  if (!url) {
    throw new Error("usage: follow <url>");
  }

  const feed = await getFeedByUrl(url);
  if (!feed) {
    throw new Error(`Feed not found: ${url}`);
  }

  // نتحقق إذا المستخدم بالفعل متابع
  const existingFollow = await getFeedFollowsForUser(user.id);
  const alreadyFollowing = existingFollow.some(f => f.feedId === feed.id);

  if (alreadyFollowing) {
    console.log(`${user.name} is already following ${feed.name}`);
    return;
  }

  // لو كل شيء تمام، نعمل follow
  const follow = await createFeedFollow(user.id, feed.id);

  console.log(`${user.name} is now following ${feed.name}`);
}



export async function handlerFollowing(cmdName: string, user: User) {
  const follows = await getFeedFollowsForUser(user.id);

  for (const f of follows) {
    console.log(f.feedName);
  }
}


export async function handlerUnfollow(
  cmdName: string,
  user: User,
  url: string
) {
  if (!url) {
    throw new Error("usage: unfollow <url>");
  }

  const feed = await deleteFeedFollowByUrl(user.id, url);

  console.log(`${user.name} unfollowed ${feed.name}`);
}

export async function handlerBrowse(
  cmdName: string,
  user: User,
  limitStr?: string
) {
  const limit = limitStr ? parseInt(limitStr) : 2;

  const posts = await getPostsForUser(user.id, limit);

  for (const post of posts) {
    console.log(post.title);
    console.log(post.url);
    console.log(`From: ${post.feedName}`);
    console.log("");
  }
}