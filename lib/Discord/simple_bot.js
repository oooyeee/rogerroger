import { EventEmitter } from "events"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import { createRequire } from "module";
import { Client, Collection, Constants, Intents } from "discord.js"
import urls from "./urls.json" assert {type: "json"}

import commandsLib from "./commands/commands.js";

const require = createRequire(import.meta.url);
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
            let comamndsList = await commands.fetch({});
            log("cleaning up commands");
            for (let [commandID, command] of comamndsList) {
                await command.delete();
                log("Deleted command: \"" + command.name + "\" with id: " + commandID);
            };

            for (let name in commandsLib) {
                log("creating command: " + name);
                await commands.create(commandsLib[name].command);
            };

            client.on("interactionCreate", async (interaction) => {
                if (!interaction.isCommand()) { return }
                const { commandName, options, channel } = interaction;

                if (commandName in commandsLib) {
                    interaction.reply(
                        commandsLib[commandName].GetReply({ options, channel })
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

        })

        this.client.login(token)
    }
}


export default Bot