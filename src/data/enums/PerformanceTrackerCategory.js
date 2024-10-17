const Enum = require('./Enum');

class PerformanceTrackerCategory extends Enum {
    constructor(code, description) {
        super(code, description);
    }

    static DEMO_PACKETS_EXTRACT = new PerformanceTrackerCategory('DEMO_PACKETS_EXTRACT', 'Demo packets extraction');
    static DEMO_PACKETS_DECOMPRESS = new PerformanceTrackerCategory('DEMO_PACKETS_DECOMPRESS', 'Demo packets decompression');

    static MESSAGE_PACKETS_EXTRACT = new PerformanceTrackerCategory('MESSAGE_PACKETS_EXTRACT', 'Message packets extraction');

    static SCRIPT = new PerformanceTrackerCategory('SCRIPT', 'Script execution');
}

module.exports = PerformanceTrackerCategory;
