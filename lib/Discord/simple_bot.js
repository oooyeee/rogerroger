import { EventEmitter } from "events"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import { createRequire } from "module";
import { Client, Collection, Constants, Intents } from "discord.js"

import commandsList from "./commands/commands.js";
import watcherFactory from "./messaging/watcher.js"
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const log = console.log;

class Bot extends EventEmitter {
    constructor(token, intents = []) {
        super();

        this.client = new Client({
            intents: intents.length == 0 ? [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES] : intents
        });

        this.client.on("ready", async (client) => {
            console.log("Bot is ready");

            let commands = client.application.commands;
            let fetchedCommands = await commands.fetch();
            log("cleaning up commands");
            for (let [commandID, command] of fetchedCommands) {
                await command.delete();
                log("Deleted command: \"" + command.name + "\" with id: " + commandID);
            };

            for (let name in commandsList) {
                log("creating command: " + name);
                await commands.create(commandsList[name].command);
            };

            client.on("interactionCreate", async (interaction) => {
                if (!interaction.isCommand()) { return }
                const { commandName, options, channel } = interaction;

                if (commandName in commandsList) {
                    interaction.reply(
                        await commandsList[commandName].GetReply({ options, channel })
                    )
                }
            });

            client.guilds.cache.forEach(async (server, serverID) => {
                log(serverID);
            })
        })

        this.client.on('guildCreate', (server) => {
            console.log("Bot JOINed the server: " + server.name + " ::: with id: " + server.id);
        });

        this.client.on('guildDelete', (server) => {
            console.log("Bot was KICKed from the server: " + server.name + " ::: with id: " + server.id);
        });

        this.client.on("messageCreate", (msg) => {
            if (!msg.author.bot) {
                watcherFactory("bully").emit("message", msg);
            }
        })

        this.client.login(token)
    }

}


export {
    Bot
}