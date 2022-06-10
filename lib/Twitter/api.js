import { EventEmitter } from "events"
import urls from "./urls.json" assert {type: "json"}

const rulesUrl = urls.rules;
// refer to https://developer.twitter.com/apitools/api?endpoint=%2F2%2Ftweets%2Fsearch%2Fstream&method=get
const streamUrl = urls.stream;

async function AddRules(BEARER_TOKEN, { value = null, values = [] }) {

    let rules = [];

    if (value !== null) {
        rules.push(value);
    }
    if (values.length > 0) {
        rules = [...new Set([...rules, ...values])];
    }

    let rulesJSONstring = "";

    try {
        rulesJSONstring = JSON.stringify({
            "add": rules.map(rule => ({ "value": rule }))
        });
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

    let response = await fetch(rulesUrl, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${BEARER_TOKEN}`
        },
        body: rulesJSONstring
    });

    if (response.status !== 200) {
        throw new Error(response.body ?? "Error in response to url: " + rulesUrl);
    }

    let updatedRulesJSON = await response.json();
    // console.log(updatedRulesJSON);

    let result = [false, {}];
    try {
        if (updatedRulesJSON?.title !== "Invalid Request" && updatedRulesJSON?.title !== "Unauthorized" && updatedRulesJSON.meta.summary.created > 0) {
            result = [true, updatedRulesJSON]
        } else {
            result = [false, updatedRulesJSON];
        }
    } catch (err) {
        result = [false, updatedRulesJSON];
        console.log("=== ERR ===");
        console.log(err)
    }

    return result;
}

async function DeleteRules(BEARER_TOKEN, { ID = null, IDs = [], Values = [] }) {
    let rules = {
        "delete": {}
    }

    if (ID !== null) {
        rules.delete.ids = [ID];
    }

    if (IDs.length > 0) {
        rules.delete.ids = [...new Set([...(rules.delete.ids ? rules.delete.ids : []), ...IDs])];
    }

    if (Values.length > 0) {
        rules.delete.values = Values
    }

    let rulesJSONstring = "";

    try {
        rulesJSONstring = JSON.stringify(rules);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

    let response = await fetch(rulesUrl, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${BEARER_TOKEN}`
        },
        body: rulesJSONstring
    });

    if (response.status !== 200) {
        throw new Error(response.body);
    }

    let json = await response.json();
    // console.log(json);

    return json
}

async function GetRules(BEARER_TOKEN) {
    let response = await fetch(rulesUrl, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${BEARER_TOKEN}`
        }
    });

    if (response.status !== 200) {
        throw new Error(response.body ?? "Error in response to url: " + rulesUrl);
    }

    let json = await response.json();
    // console.log(json);
    let rules = json.data ?? [];

    return rules;
}

// req headers
//[ 'x-rate-limit-limit', '50' ]
//[ 'x-rate-limit-remaining', '45' ]

async function GetStream(BEARER_TOKEN, stream_url = streamUrl) {
    let emitter = new EventEmitter();

    let abortController = new AbortController();

    let response = await fetch(stream_url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${BEARER_TOKEN}`
        },
        signal: abortController.signal
    }).catch(err => { console.log(err) });

    if (response.status !== 200) {
        throw new Error(response.body ?? "Error in response to url: " + stream_url);
    }

    //================ @TODO check rate limit, prevent errors
    for (let [header, headerValue] of response.headers) {
        if (header === "x-rate-limit-reset") {
            console.log(header + " => " + headerValue);
        }
        if (header === "x-rate-limit-remaining") {
            console.log(header + " => " + headerValue);
            if (headerValue <= 46) {
                console.log("next stream, probably, will not run until reset")
            }
        }
    }
    //================

    let reader = response.body.getReader();

    // From https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
    let newStream = new ReadableStream({
        start: function (controller) {
            return pump();
            function pump() {
                return reader.read().then(({ done, value }) => {
                    try {
                        let newDataString = Buffer.from(value).toString("utf8").trim();
                        if (newDataString !== "") {
                            emitter.emit("message", newDataString);
                        }
                    } catch (err) {
                        console.log(err);
                    }
                    if (done) {
                        controller.close();
                        // console.log("=== No more data, closing stream ===");
                        return;
                    }
                    // Enqueue the next data chunk into our target stream
                    controller.enqueue(value);
                    return pump();
                });
            }
        }
    });

    async function abort() {
        abortController.abort();
        await newStream.cancel();
    }

    emitter.on("abort", async () => {
        await abort();
    })

    return emitter;
}

function ParseTweet(tweetJSONstring) {
    let result = [];
    try {
        let json = JSON.parse(tweetJSONstring);
        console.log(json);
        if (json.matching_rules && Array.isArray(json.matching_rules)) {
            json.matching_rules.forEach(rule => {
                if (typeof (rule.id) !== "undefined" && rule.id !== "") result.push(rule.id);
            })
        }
    } catch (err) {
        console.log("== BAD JSON from Twitter ERROR ==");
        console.log(err);
    }
    return result
}

export {
    AddRules,
    DeleteRules,
    GetRules,
    GetStream,
    ParseTweet
}