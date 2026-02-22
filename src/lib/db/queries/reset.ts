import { db } from "..";
import { users } from "../schema";

export async function resetUsers() {
  await db.delete(users);
}
