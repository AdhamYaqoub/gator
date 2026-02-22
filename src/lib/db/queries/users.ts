import { db } from "..";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import { readConfig } from "../../../config";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUserByName(name: string) {
  const [result] = await db.select().from(users).where(eq(users.name, name));
  return result;
}

export async function getUsers() {
  return await db.select().from(users);
}

export async function getCurrentUser() {
  const config = readConfig();
  if (!config.currentUserName) {
    return undefined;
  }
  const [user] = await db.select().from(users).where(eq(users.name, config.currentUserName));
  return user;
}