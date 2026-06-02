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
 * @typedef {{
 *   maxArrayBufferUsage: number|null,
 *   maxExternalUsage: number|null,
 *   maxHeapUsed: number|null,
 *   maxMemoryUsage: number|null,
 *   maxResidentSetSize: number|null
 * }} MemoryTrackerStats
 */

export default MemoryTracker;
