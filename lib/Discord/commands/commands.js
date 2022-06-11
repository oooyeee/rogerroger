import path from "path"
import fs from "fs"
import { fileURLToPath, pathToFileURL } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let commands = {}

let list = fs.readdirSync(path.resolve(__dirname, "list"));

// list.forEach(async (fileName) => {
//     if (fileName.endsWith(".js")) {
//         let filePath = pathToFileURL(path.resolve(__dirname, "list/" + fileName));
//         console.log("file: " + filePath);
//         console.log("wtf");
//         let cmd = await import(filePath);
//         if (cmd?.name) {
//             commands[cmd.name] = cmd;
//         }
//     }

// })

for (let fileName of list) {
    if (fileName.endsWith(".js")) {
        let filePath = pathToFileURL(path.resolve(__dirname, "list/" + fileName));
        console.log("file: " + filePath);
        let cmd = await import(filePath);
        console.log("wtf");
        if (cmd?.name) {
            commands[cmd.name] = cmd;
        }
    }
}


export default commands