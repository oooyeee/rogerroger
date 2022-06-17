import { randomUUID } from "crypto"
import { Constants, CommandInteractionOptionResolver, MessageAttachment } from "discord.js"
import { fileURLToPath } from "url"
import path from "path"
import fs from "fs"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.join(__dirname, "template.png");
// const __projectRoot = path.resolve(__dirname, "../../../../");
const templateBuffer = Buffer.from(fs.readFileSync(templatePath))
let { width, height } = await sharp(templateBuffer).metadata();

const name = "template_grenki"

const command = {
    name: name,
    description: "Hehe <3",
    options: [
        {
            name: "image",
            description: "your image",
            required: true,
            type: Constants.ApplicationCommandOptionTypes.ATTACHMENT
        }
    ]
}

/**
 * Builds reply
 * @param {{options: CommandInteractionOptionResolver}} options Interaction options
 */
const GetReply = async ({ options }) => {
    let image = options.getAttachment("image");

    let file = await DrawOnTemplate({ imgUrl: image.url });

    return {
        content: "hehe",
        files: [file]
    }
}

async function DrawOnTemplate({ imgUrl }) {
    let resp = await fetch(imgUrl, {
        method: "GET"
    }).then(res => res.arrayBuffer());

    let file = Buffer.from(resp);

    let transformedFile = await sharp(file)
        .resize(438, 618, { fit: "cover" })
        .rotate(1.39, { background: "#ffffff00" })
        .png({ palette: true, quality: 100 })
        .toBuffer()

    let output = await sharp({
        create: {
            width: width,
            height: height,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
        }
    }).composite(
            [
                { input: transformedFile, top: 383, left: 257 },
                { input: templateBuffer, gravity: "centre", },
            ]
        )
        .raw()
        .png()
        .toBuffer()

    return output
}

export {
    name,
    command,
    GetReply
}