import fs from "fs"
import path from "path"
import sharp from "sharp"
import { randomUUID } from "crypto"

let templateFile = "./template.png"
let pasteImg = "./AwesomeJesus2.png"


let newFilePath = "./" + randomUUID() + "_image.png";

let file = fs.readFileSync(templateFile)

file = Buffer.from(file);

// fs.writeFileSync(newFilePath, file, { flag: "w" })

let img = await sharp(file)

let meta = await img.metadata()

let alpha = await img.extractChannel("alpha")
    .raw()
    .extract({
        left: 257,
        top: 383,
        height: 618,
        width: 438
    })
    .rotate(-1.39, { background: "#ffffffff" })
    .png({ palette: true, quality: 100 })
    .toBuffer()

let second = await sharp(alpha)
    .raw()
    .extract({
        left: 8,
        top: 6,
        height: 618,
        width: 438
    })
    .png({ palette: true, quality: 100 })
    .toBuffer()


fs.writeFileSync(newFilePath, second, { flag: "w" })

console.log(meta);