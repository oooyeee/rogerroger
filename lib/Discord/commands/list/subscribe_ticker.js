import { Constants, CommandInteractionOptionResolver, MessageEmbed } from "discord.js"
import { Ticker } from "../../../Crypto/ticker.js"
import keys from "../../../../keys.json" assert {type: "json"}

import { fileURLToPath } from "url"
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const GuildTextBasedChannel = require("discord.js").GuildTextBasedChannel;

const name = "sub_ticker_here"

const command = {
    name: name,
    description: "Subscribe this channel to Crypto ticker",
    options: [
        {
            name: "toggle",
            description: "type: yes/no. Anything else will make no effect",
            required: false,
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ]
}

class TickerSubs {
    #subs = {}

    addSub(channel) {
        if (!this.#subs[channel.id]) {
            this.#subs[channel.id] = channel
        }
    }

    removeSub(channel) {
        if (this.#subs[channel.id]) {
            delete this.#subs[channel.id];
        }
    }

    notifyAll(coin, currency, json) {
        for (let channelID in this.#subs) {
            this.#subs[channelID].send({ embeds: [this.#buildRichMsg(coin, currency, json)] })
        }
    }

    #buildRichMsg(coin, currency, json) {
        // console.log(json);
        let embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${coin}/${currency} stats`)
            .addFields(
                { name: 'Rate', value: `${json.rate}`, inline: false },
                { name: 'Volume', value: `${json.volume}`, inline: false },
                { name: 'Cap', value: `${json.cap}`, inline: false }
            )
        return embed
    }
}

let subscribed = new TickerSubs();

let ticker = new Ticker(keys.livecoinwatch_key, "BTC", "USDT", 5000);
ticker.init();

ticker.on("tick", (json) => {
    // console.log(json);
    subscribed.notifyAll(ticker.coin, ticker.currency, json);
});







/**
 * Builds reply
 * @param {{options: CommandInteractionOptionResolver, channel: GuildTextBasedChannel}} options Interaction options
 */
const GetReply = ({ options, channel }) => {
    let toggle = options.getString("toggle");
    // console.log("toggle: " + toggle);
    let result;

    if (toggle === "yes") {
        result = `#${channel.name} channel is subscribed`
        subscribed.addSub(channel)

    } else if (toggle === "no") {
        result = `#${channel.name} channel is unsubscribed`
        subscribed.removeSub(channel)
    } else {
        result = `#${channel.name} channel subscribtion remains unchanged`
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