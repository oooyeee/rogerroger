import { EventEmitter } from "events"
import { Message } from "discord.js"

let watchers = {}
function WatcherFactory(watcherName) {
    const prepend = "O_O";
    let selectedWatcher = prepend + watcherName;
    if (watchers[selectedWatcher]) {
        return watchers[selectedWatcher]
    }

    watchers[selectedWatcher] = new Watcher(watcherName);
    return watchers[selectedWatcher]
}

class Watcher extends EventEmitter {
    constructor(watcherName = null) {
        super();
        this.watcherName = watcherName
        // let watchList = {
        //     "1111_userid_id_11111": {
        //         "channel_id_1": channel,
        //         "channel_id_2": channel,
        //         "channel_id_3": channel
        //     }
        // }
        this.watchList = {}
    }

    addToWatchList(userID, channel) {
        let added = true;

        if (!this.watchList[userID]) {
            this.watchList[userID] = Object.fromEntries([[channel.id, channel]]);
        } else if (!this.watchList[userID][channel.id]) {
            this.watchList[userID][channel.id] = channel
        } else {
            added = false
        }

        return added
    }
    removeFromWatchList(userID, channel) {
        let removed = true;

        if (this.watchList[userID] && this.watchList[userID][channel.id]) {
            delete this.watchList[userID][channel.id];
            if (Object.keys(this.watchList[userID]).length == 0) {
                delete this.watchList[userID];
            }
        } else {
            removed = false
        }

        return removed;
    }

    filter(userID, channelID) {
        console.log("HERE");
        console.log(userID + " :: " + channelID);
        return {
            send: !this.watchList[userID] ? (msg) => { console.log(msg); } : (bot_msg) => {
                console.log("got msg: " + bot_msg);
                for (let chID in this.watchList[userID]) {
                    if (chID === channelID) {
                        this.watchList[userID][channelID].send(bot_msg)
                    }
                }
            }
        }
    }
}

export {
    WatcherFactory as default,
    Watcher
}