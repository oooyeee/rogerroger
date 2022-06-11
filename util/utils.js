async function delay(ms, fn = () => { }) {
    return new Promise((resolve) => {
        setTimeout(() => { resolve(fn()) }, ms)
    })
}

async function pause(ms) {
    return new Promise((resolve) => {
        setTimeout(() => { resolve(true) }, ms)
    })
}

class Debouncer {
    #debounceTimer = null;
    debounce(time, fn = () => { }) {
        clearTimeout(this.#debounceTimer);
        this.#debounceTimer = setTimeout(() => { fn() }, time);
    }
}

class Throttler {
    #throttlePause = false;
    throttle(time, fn = () => { }) {
        if (this.#throttlePause) return;
        this.#throttlePause = true;
        setTimeout(() => {
            fn();
            this.#throttlePause = false;
        }, time);
    }
}


export {
    delay,
    pause,
    Debouncer,
    Throttler
}