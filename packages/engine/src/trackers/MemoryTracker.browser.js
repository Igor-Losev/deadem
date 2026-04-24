import MemoryTracker from './MemoryTracker.js';

class MemoryTrackerBrowser extends MemoryTracker {
    constructor() {
        super();

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
}

export default MemoryTrackerBrowser;
