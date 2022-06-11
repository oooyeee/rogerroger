import { EventEmitter } from "events"
import { AddRules, DeleteRules, GetRules, GetStream, ParseTweet } from "./api.js"
import urls from "./urls.json" assert {type: "json"}

// {"data":{"author_id":"1533112177212661761","created_at":"2022-06-10T10:46:42.000Z","id":"1535211851214094339","text":"test asdasdq"},"matching_rules":[{"id":"1535211772172451840","tag":""}]}

class TweetsStream extends EventEmitter {
    // [{id:"132123", value: "from:asdasd"}]
    #rules = [];
    constructor(BEARER_TOKEN) {
        super();
        this.BEARER_TOKEN = BEARER_TOKEN;
    }

    getRules() {
        return this.#rules
    }

    async AddRules({ value = null, values = [] }) {
        let [res, json] = await AddRules(this.BEARER_TOKEN, { value, values });
        this.#rules = await GetRules(this.BEARER_TOKEN);
        return [res, json]
    }

    async DeleteRule(value) {
        console.log(["[DeleteRule] rule value: ", value]);
        let [res, json] = await DeleteRules(this.BEARER_TOKEN, { Values: [value] });
        this.#rules = await GetRules(this.BEARER_TOKEN);
        return [res, json]
    }

    async init() {
        this.#rules = await GetRules(this.BEARER_TOKEN);

        let stream = await GetStream(this.BEARER_TOKEN, urls.stream);

        stream.on("message", (msg) => {
            // let json_msg = JSON.parse(msg);
            // this.#rules.forEach(rule => {
            //     if (json_msg.matching_rules && Array.isArray(json_msg.matching_rules)) {
            //         json_msg.matching_rules.forEach(matching_rule => {
            //             if (typeof (matching_rule.id) !== "undefined" && matching_rule.id !== "") {
            //                 if (rule.id === matching_rule.id) {
            //                     this.emit(rule.value, json_msg);
            //                 }
            //             }
            //         })
            //     }
            // });
            this.emit("tweet", msg);
        })
    }
}


export {
    TweetsStream
}