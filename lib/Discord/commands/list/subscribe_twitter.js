import { Constants, CommandInteractionOptionResolver } from "discord.js"
import { GetStream } from "../../../Twitter/api.js"

import { fileURLToPath } from "url"
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const GuildTextBasedChannel = require("discord.js").GuildTextBasedChannel;

const name = "sub_twitter_here"

const command = {
    name: name,
    description: "Subscribe twitter stream to this channel",
    options: [
        {
            name: "toggle",
            description: "type: yes/no. Anything else will make no effect",
            required: false,
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ]
}

let subscribed = {};

/**
 * Builds reply
 * @param {{options: CommandInteractionOptionResolver, channel: GuildTextBasedChannel}} options Interaction options
 */
const GetReply = ({ options, channel }) => {
    let toggle = options.getString("toggle");
    console.log("toggle: " + toggle);

    let result;
    // let interval;
    if (toggle === "yes") {
        result = "channel is subscribed"

        // console.log(typeof (channel));
        // if (typeof (channel) == GuildTextBasedChannel) {
        let counter = 0;
        subscribed[channel.id] = setInterval(() => {
            channel.send("tweet N: " + ++counter);
        }, 5000);
        // }
    } else if (toggle === "no") {
        result = "channel is unsubscribed"
        clearInterval(subscribed[channel.id]);
    } else {
        result = "channel subscribtion remains unchanged"
    }

    return {
        content: result
    }
}

export {
    name,
    command,
    GetReply
}