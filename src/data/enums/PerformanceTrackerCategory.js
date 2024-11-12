const assert = require('node:assert/strict');

class PerformanceTrackerCategory {
    /**
     * @private
     * @constructor
     * @param {String} code
     * @param {String} description
     */
    constructor(code, description) {
        assert(typeof code === 'string' && code.length > 0);
        assert(typeof description === 'string' && description.length > 0);

        this._code = code;
        this._description = description;
    }

    static DEMO_PACKETS_EXTRACT = new PerformanceTrackerCategory('DEMO_PACKETS_EXTRACT', 'Demo packets extraction');
    static DEMO_PACKETS_DECOMPRESS = new PerformanceTrackerCategory('DEMO_PACKETS_DECOMPRESS', 'Demo packets decompression');

    static MESSAGE_PACKETS_EXTRACT = new PerformanceTrackerCategory('MESSAGE_PACKETS_EXTRACT', 'Message packets extraction');

    static SCRIPT = new PerformanceTrackerCategory('SCRIPT', 'Script execution');
}

module.exports = PerformanceTrackerCategory;
