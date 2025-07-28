import Assert from './Assert.js';
import Queue from './Queue.js';

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
        this._queue = new Queue();
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

        return new Promise((resolve) => {
            this._queue.enqueue(resolve);
        });
    }

    /**
     * @public
     */
    release() {
        if (this._queue.size > 0) {
            const resolve = this._queue.dequeue();

            resolve();
        } else {
            this._count -= 1;
        }
    }
}

export default Semaphore;
