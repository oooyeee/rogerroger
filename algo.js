import fs from "fs"
import path from "path"
import sharp from "sharp"
import { randomUUID } from "crypto"

let templateFile = "./template.png"
let pastaFile = "./apexips.png"
let newFilePath = "./" + randomUUID() + "_image.png";

let main = fs.readFileSync(templateFile)
main = Buffer.from(main);

let meta = await sharp(main).metadata();
console.log(meta)
let { width, height } = meta

let pasted = fs.readFileSync(pastaFile)
pasted = Buffer.from(pasted);

let transformedPasta = await sharp(pasted)
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
})
    .composite(
        [
            { input: transformedPasta, top: 383, left: 257 },
            { input: main, gravity: "centre", },
        ]
    )
    .raw()
    .png()
    .toBuffer()

fs.writeFileSync(newFilePath, output, { flag: "w" })