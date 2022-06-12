import { EventEmitter } from "events"

// class Kek extends EventEmitter {
//     constructor() {
//         super();
//     }

// }

// let kek = new Kek();

// kek.once("tweet", (msg) => {
//     console.log("once tweet: " + msg)
// })

// let counter = 0;
// setInterval(() => {
//     kek.emit("tweet", ++counter);
// }, 2000)

// let anotherListener = 2;
// setInterval(() => {
//     kek.on("tweet", (msg) => {
//         console.log("listener " + anotherListener++ + " :: tweet: " + msg)
//     })
// }, 6000)


let subs = {
    "from:ooo": {
        "channels": [
            {
                "id": 111,
                "value": "111"

            },
            {
                "id": 222,
                "value": "222"
            },
            {
                "id": 333,
                "value": "333"
            }
        ]
    },
    "from:eee": {
        "channels": [
            {
                "id": 111,
                "value": "111"

            },
            {
                "id": 222,
                "value": "222"
            },
            {
                "id": 333,
                "value": "333"
            }
        ]
    }
}

// for (let sub in subs) {
//     subs[sub].channels.splice(subs[sub].channels.findIndex((channel) => {
//         return channel.id === 222
//     }), 1)
// }

// for(let sub in subs){
//     console.log(subs[sub]);
// }
// console.log(subs);

let matches = subs["from:eee"].channels.reduce((arr, item) => {
    if (item.id < 300) {
        arr.push({ "found": item.id })
    }
    return arr
}, []);
console.log(matches);


let kek = {
    "111": 111,
    "222": 222
}

let woof = {}

console.log(!(kek["333"]) ? "does not exist" : "exists");
console.log(true ? "does not exist" : "exists");

console.log(Object.keys(woof).length);



























