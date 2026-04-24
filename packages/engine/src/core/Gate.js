class Gate {
    /**
     * @public
     * @constructor
     */
    constructor() {
        this._tokens = 0;
        this._queue = [];
    }

    /**
     * Waits for a token to be available.
     * If tokens have been pre-released, returns immediately.
     *
     * @public
     * @returns {Promise<void>}
     */
    async acquire() {
        if (this._tokens > 0) {
            this._tokens -= 1;

            return;
        }

        return new Promise((resolve, reject) => {
            this._queue.push({ resolve, reject });
        });
    }

    /**
     * Rejects all pending acquires, preventing further use.
     *
     * @public
     */
    destroy() {
        while (this._queue.length > 0) {
            const { reject } = this._queue.shift();

            reject(new Error('Gate destroyed'));
        }
    }

    /**
     * Releases a token. If someone is waiting, unblocks them.
     * Otherwise, stores the token for a future acquire.
     *
     * @public
     */
    release() {
        if (this._queue.length > 0) {
            const { resolve } = this._queue.shift();

            resolve();
        } else {
            this._tokens += 1;
        }
    }
}

export default Gate;
