import Assert from './Assert.js';

class Semaphore {
    /**
     * @public
     * @constructor
     * @param {number} limit
     */
    constructor(limit) {
        Assert.isTrue(Number.isInteger(limit));

        this._count = 0;
        this._limit = limit;
        this._queue = [ ];
    }

    /**
     * @public
     * @returns {Promise<void>}
     */
    async acquire() {
        if (this._count < this._limit) {
            this._count += 1;

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

            reject(new Error('Semaphore destroyed'));
        }
    }

    /**
     * @public
     */
    release() {
        if (this._queue.length > 0) {
            const { resolve } = this._queue.shift();

            resolve();
        } else {
            this._count -= 1;
        }
    }
}

export default Semaphore;
