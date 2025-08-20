import Tracker from './Tracker.js';

class MemoryTracker extends Tracker {
    /**
     * @abstract
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * @public
     */
    off() {

    }

    /**
     * @public
     */
    on() {

    }
}

/**
 * @typedef {{maxMemoryUsage: number|null}} MemoryTrackerStats
 */

export default MemoryTracker;
