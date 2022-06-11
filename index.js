import CleanUp from "./cleanup_rules.js";
import { Bot } from "./lib/Discord/simple_bot.js"

import keys from "./keys.json" assert {type: "json"}

//cleanup rules
await CleanUp();

//run bot
let bot = new Bot(keys.discord_token)

