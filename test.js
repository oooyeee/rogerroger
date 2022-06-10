import Bot from "./lib/Discord/simple_bot.js"
import { GetRules } from "./lib/Twitter/api.js"
import keys from "./keys.json" assert {type: "json"}


// let rules = await GetRules(keys.BEARER_TOKEN)

// console.log(rules);

let bot = new Bot(keys.discord_token);


