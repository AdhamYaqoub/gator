import { getCurrentUser } from "../lib/db/queries/users.js";
import { CommandHandler, UserCommandHandler } from "../commands.js";

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
  return async (cmdName: string, ...args: string[]) => {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("You must be logged in to run this command");
    }

    await handler(cmdName, user, ...args);
  };
}
