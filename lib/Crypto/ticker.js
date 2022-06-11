import { EventEmitter } from "events"
import { clearInterval } from "timers"

import { urls } from "./urls.json" assert {type: "json"}

class CryptoDataNoMetaObj {
    constructor({ rate = NaN, volume = NaN, cap = NaN, liquidity = NaN }) {
        this.rate = rate
        this.volume = volume
        this.cap = cap
        this.liquidity = liquidity
    }
}

/**
 * Fetches coin data from livecoinwatch
 * @param {string} coin Coin
 * @param {string} currency Currency
 * @returns {CryptoDataNoMetaObj} returns Json object
 */
async function GetPairData(apikey, coin = "BTC", currency = "USDT") {
    let requestBody = {
        currency: currency,
        code: coin,
        meta: false
    }

    return fetch(urls.cointicker, {
        method: "GET",
        headers: {
            "Content-type": "application/json",
            "x-api-key": apikey
        },
        body: JSON.stringify(requestBody)
    }).catch((err) => { console.log(err); return new CryptoDataNoMetaObj() })
}

class Ticker extends EventEmitter {
    #timer = null;
    constructor(apikey, coin = "BTC", currency = "USDT", interval_ms = 5000) {
        super();
        this.coin = coin
        this.currency = currency
        this.interval = interval_ms
        this.apikey = apikey
    }

    init(interval_ms = null) {
        this.#timer = setInterval(() => {
            this.emit("tick", GetPairData(this.apikey, this.coin, this.currency));
        }, interval_ms ?? this.interval);
    }

    stop() {
        clearInterval(this.#timer);
    }

}

export {
    GetPairData,
    Ticker,
    CryptoDataNoMetaObj as CryptoDataNoMeta
}