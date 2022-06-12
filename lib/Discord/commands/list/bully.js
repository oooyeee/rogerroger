import { Constants, CommandInteractionOptionResolver } from "discord.js"
import { SlashCommandBuilder } from '@discordjs/builders'

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const GuildTextBasedChannel = require("discord.js").GuildTextBasedChannel;

import WatcherFactory from "../../messaging/watcher.js"

let watcher = WatcherFactory("bully");

watcher.on("message", (msg) => {
    watcher.filter(msg.author.id, msg.channel.id).send(`you s*ck, ${Mention(msg.author.id)}`)
});


const name = "bully"

let cb = new SlashCommandBuilder()

cb.setName(name).setDescription("Make this person cry")
    .addUserOption(
        (builder) => {
            builder.setName("name")
                .setDescription("user's name")
                .setRequired(true)
                .type = Constants.ApplicationCommandOptionTypes.MENTIONABLE
            return builder
        }
    ).addBooleanOption(
        (option) => {
            option.setName("unbully")
                .setDescription("should unbully ? y/n")
                .setRequired(false);
            return option
        }
    )

const command = cb.toJSON();

// console.log(command);

/**
 * Builds reply
 * @param {{options: CommandInteractionOptionResolver, channel: GuildTextBasedChannel}} options Interaction options
 */
const GetReply = ({ options, channel }) => {
    let user = options.getMentionable("name");
    let unbully = options.getBoolean("unbully");

    let status = `hehe ${Mention(user.id)}`;
    let success;
    if (unbully) {
        success = watcher.removeFromWatchList(user.id, channel);
        if (success) {
            status = `:heart: ${Mention(user.id)}`;
        } else {
            status = `nobody bullied this person here`;
        }
    } else {
        success = watcher.addToWatchList(user.id, channel)
        // console.log(Object.keys(watcher.watchList));
        if (!success) {
            status = `this person is already being bullied`;
        }
    }

    return {
        content: status
    }
}

function Mention(userID) {
    return `<@${userID}>`
}




//===========================================================
// let lib = {
//     name,
//     command,
//     GetReply
// }

export {
    name,
    command,
    GetReply
}