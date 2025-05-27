import MemoryTracker from './MemoryTracker.js';

class MemoryTrackerBrowser extends MemoryTracker {
    constructor() {
        super();

        this._stats = {
            maxMemoryUsage: null
        };
    }

    /**
     * @public
     * @returns {{maxMemoryUsage: number|null}}
     */
    getStats() {
        return {
            ...this._stats
        };
    }
}

export default MemoryTrackerBrowser;
