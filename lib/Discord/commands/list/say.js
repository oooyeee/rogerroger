import { Constants, CommandInteractionOptionResolver } from "discord.js"

const name = "say"

const command = {
    name: name,
    description: "Make bot say",
    options: [
        {
            name: "sentence",
            description: "your sentence",
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ]
}

/**
 * Builds reply
 * @param {{options: CommandInteractionOptionResolver}} options Interaction options
 */
const GetReply = ({ options }) => {
    let sentence = options.getString("sentence");

    return {
        content: "repeating: " + sentence
    }
}

export {
    name,
    command,
    GetReply
}