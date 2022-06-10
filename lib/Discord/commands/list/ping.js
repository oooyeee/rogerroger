const name = "ping"

const command = {
    name: name,
    description: "Replies with pong"
}

/**
 * Builds reply
 * @param {{options: CommandInteractionOptionResolver}} options Interaction options
 */
const GetReply = (options) => {
    return {
        content: "pong"
    }
}

export {
    name,
    command,
    GetReply
}