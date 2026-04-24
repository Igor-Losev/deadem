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
            maxArrayBufferUsage: null,
            maxExternalUsage: null,
            maxHeapUsed: null,
            maxMemoryUsage: null,
            maxResidentSetSize: null
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

        this._sample();

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

        this._sample();

        this._intervalId = setInterval(() => {
            this._sample();
        }, this._intervalMilliseconds);
    }

    /**
     * @protected
     */
    _sample() {
        const memoryUsage = process.memoryUsage();
        const combinedMemoryUsage = memoryUsage.heapUsed + memoryUsage.external;

        updateMax(this._stats, 'maxArrayBufferUsage', memoryUsage.arrayBuffers);
        updateMax(this._stats, 'maxExternalUsage', memoryUsage.external);
        updateMax(this._stats, 'maxHeapUsed', memoryUsage.heapUsed);
        updateMax(this._stats, 'maxMemoryUsage', combinedMemoryUsage);
        updateMax(this._stats, 'maxResidentSetSize', memoryUsage.rss);
    }
}

/**
 * @param {MemoryTrackerStats} stats
 * @param {keyof MemoryTrackerStats} key
 * @param {number} value
 */
function updateMax(stats, key, value) {
    if (stats[key] === null || value > stats[key]) {
        stats[key] = value;
    }
}

export default MemoryTrackerNode;
