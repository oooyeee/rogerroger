import { Constants, CommandInteractionOptionResolver } from "discord.js"
import { TweetsStream } from "../../../Twitter/stream.js"
import keys from "../../../../keys.json" assert {type: "json"}
import rules from "../../../Twitter/example_rules.json" assert {type: "json"}
import { fileURLToPath } from "url"
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const GuildTextBasedChannel = require("discord.js").GuildTextBasedChannel;

const name = "sub_twitter_here";

let stream = new TweetsStream(keys.twitter_bearer_token);
await stream.AddRules({ values: [rules.oooyeee, rules.musk] })
await stream.init();

const command = {
    name: name,
    description: "Subscribe twitter stream to this channel",
    options: [
        {
            name: "rule",
            description: "twitter api rule, example: from:elonmusk",
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: "toggle",
            description: "type: yes/no. Anything else will make no effect",
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ]
}

// let subs = {
//     "from:oooyeee": {
//         "channels": ["channel", "channel"]
//     }
// }

class Subs {
    #subs = []
    constructor(twitter_stream) {
        this.stream = twitter_stream
    }

    async addSub(ruleValue, channel) {

        let [success, json] = await stream.AddRules({ value: ruleValue });
        if (!success) {
            return "rule is invalid"
        }
        let result = "skip";

        if (!this.#subs[ruleValue]) {
            this.#subs[ruleValue] = {
                "channels": [channel]
            }
            //=========================================
            // console.log("== SUBS New list ==");
            // console.log(this.#subs[ruleValue]);
            //=========================================
            result = "added"
        } else {
            if (!this.#subs[ruleValue].channels.some(subbedChannel => channel.id == subbedChannel.id)) {
                //=========================================
                // console.log("== SUBS new rule in list ==");
                // console.log(this.#subs[ruleValue]);
                //=========================================
                this.#subs[ruleValue].channels.push(channel);
                result = "added"
            } else {
                //=========================================
                // console.log("== SUBS skip, rule exists for channel ==");
                // console.log(this.#subs[ruleValue]);
                //=========================================
                result = "skip"
            }
        }
        return result
    }

    async removeSub(ruleValue, channel) {
        // console.log(["[removeSub] rule value: ", ruleValue]);

        let result = "skip";
        if (this.#subs[ruleValue]) {
            let foundIndex = this.#subs[ruleValue].channels.findIndex(ch => ch.id == channel.id)
            if (foundIndex !== -1) {
                this.#subs[ruleValue].channels.splice(
                    foundIndex,
                    1
                );
                if (this.#subs[ruleValue].channels.length == 0) {
                    delete this.#subs[ruleValue];
                    let [success, json] = await stream.DeleteRule(ruleValue);
                    // console.log("== DELETE TWITTER RULE RESULT ==");
                    // console.log(json);
                }
                result = "removed"
            }
        } else {
            result = "rule is invalid"
        }
        return result
    }

    notify_byRules(json_msg, rules) {
        // rules = [{id, value}]
        // json_msg = {matching_rules: [{id}]}
        let matching_rules = json_msg.matching_rules.reduce((newArr, rule) => {
            let ruleMatch = rules.find((r) => r.id == rule.id);
            if (ruleMatch) {
                newArr.push(ruleMatch)
            }
            return newArr;
        }, []);

        matching_rules.forEach(rule => {
            if (this.#subs[rule.value]) {
                this.#subs[rule.value].channels.forEach(channel => {
                    // channel.send("tweet: " + json_msg.data.text);
                    channel.send(this.#getTweetUrl(json_msg));
                })
            }
        })
    }

    notify_channel(channel) {

    }

    #getTweetUrl(json_msg) {
        // https://twitter.com/oooyeeeha/status/1535474203650039808
        let username = json_msg.includes.users[0].username;
        let tweetID = json_msg.data.id;
        let url = `https://twitter.com/${username}/status/${tweetID}`;
        return url
    }
}


let subscribers = new Subs(stream);
stream.on("tweet", msg => {
    console.log(msg);
    let json_msg = JSON.parse(msg);
    subscribers.notify_byRules(json_msg, stream.getRules());
});

/**
 * Builds reply
 * @param {{options: CommandInteractionOptionResolver, channel: GuildTextBasedChannel}} options Interaction options
 */
const GetReply = async ({ options, channel }) => {
    let rule = options.getString("rule");
    let toggle = options.getString("toggle");
    // console.log("rule: " + rule)
    // console.log("rule: " + toggle)
    // console.log("channel ID: " + channel.id + " :: name: " + channel.name);

    let note = `#${channel.name} channel subscribtion remains unchanged`;

    if (toggle === "yes") {
        note = `#${channel.name} `;
        note += await subscribers.addSub(rule, channel);
    } else if (toggle === "no") {
        note = `#${channel.name} `;
        note += await subscribers.removeSub(rule, channel);
    }

    // console.log("note: " + note);
    return {
        content: note
    }
}

export {
    name,
    command,
    GetReply
}