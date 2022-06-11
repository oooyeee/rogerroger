import { GetRules, DeleteRules } from "./lib/Twitter/api.js"
import { strict as assert } from "assert"
import keys from "./keys.json" assert {type: "json"}

const log = console.log;

async function CleanUp(shouldAssert = false) {
    //cleanup rules
    let rules = await GetRules(keys.twitter_bearer_token)
    log(rules);
    let res = await DeleteRules(keys.twitter_bearer_token, { IDs: rules.map(rule => rule.id) })
    log(res)
    rules = await GetRules(keys.twitter_bearer_token)
    log(rules);

    if (shouldAssert) {
        assert.deepEqual(rules, [], "Rules are not cleaned up");
    }
}

export default CleanUp