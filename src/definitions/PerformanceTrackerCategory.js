class PerformanceTrackerCategory {
    constructor(code, description) {
        this._code = code;
        this._description = description;
    }

    get code() {
        return this._code;
    }

    static DEMO_PACKETS_DECOMPRESS = new PerformanceTrackerCategory('DEMO_PACKETS_DECOMPRESS', 'Decompressing of demo packets');
    static DEMO_PACKETS_EXTRACT = new PerformanceTrackerCategory('DEMO_PACKETS_EXTRACT', 'Extraction of demo packets')
    static DEMO_PACKETS_PARSE = new PerformanceTrackerCategory('DEMO_PACKETS_PARSE', 'Parsing of demo packets');
    static SCRIPT = new PerformanceTrackerCategory('SCRIPT', 'Script');
}

module.exports = PerformanceTrackerCategory;
