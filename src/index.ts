import { registerCommand, runCommand, handlerLogin, handlerRegister,handlerReset,handlerUsers,handlerAddFeed,handlerFollow,handlerFollowing, handlerBrowse } from "./commands.js";
import { handlerAgg ,handlerFeeds, handlerUnfollow, handlerSearch } from "./commands.js";
import { middlewareLoggedIn } from "./middleware/loggedIn.js";

async function main() {
  const registry = {};

  registerCommand(registry, "register", handlerRegister);
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "reset", handlerReset);
  registerCommand(registry, "users", handlerUsers);
  registerCommand(registry, "agg", handlerAgg);
  registerCommand(registry, "feeds", handlerFeeds);

  registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
  registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
  registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
  
  registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));

  registerCommand(registry, "browse", middlewareLoggedIn(handlerBrowse));

registerCommand(registry, "search", middlewareLoggedIn(handlerSearch));

  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error("not enough arguments");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);

  try {
    await runCommand(registry, cmdName, ...cmdArgs);
    process.exit(0);
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
}

main();
