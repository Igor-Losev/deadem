import MemoryTracker from './MemoryTracker.js';

class MemoryTrackerNode extends MemoryTracker {
    /**
     * @constructor
     * @param {number} intervalMilliseconds
     */
    constructor(intervalMilliseconds = 10) {
        super();

        this._intervalMilliseconds = intervalMilliseconds;
        this._intervalId = null;

        this._stats = {
            maxMemoryUsage: null
        };
    }

    /**
     * @public
     * @returns {MemoryTrackerStats}
     */
    getStats() {
        return {
            ...this._stats
        };
    }

    /**
     * @public
     */
    off() {
        if (this._intervalId === null) {
            throw new Error('Unable to call MemoryTracker.off()');
        }

        clearInterval(this._intervalId);

        this._intervalId = null;
    }

    /**
     * @public
     */
    on() {
        if (this._intervalId !== null) {
            throw new Error('Unable to call MemoryTracker.on()');
        }

        this._intervalId = setInterval(() => {
            const memoryUsage = process.memoryUsage.rss();

            if (this._stats.maxMemoryUsage === null || memoryUsage > this._stats.maxMemoryUsage) {
                this._stats.maxMemoryUsage = memoryUsage;
            }
        }, this._intervalMilliseconds);
    }
}

export default MemoryTrackerNode;
