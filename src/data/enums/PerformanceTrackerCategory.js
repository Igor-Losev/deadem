const assert = require('node:assert/strict');

const registry = {
    byCode: new Map()
};

class PerformanceTrackerCategory {
    /**
     * @private
     * @constructor
     * @param {String} code
     * @param {String} description
     * @param {Array<PerformanceTrackerCategory>} subcategories
     */
    constructor(code, description, subcategories = [ ]) {
        assert(typeof code === 'string' && code.length > 0);
        assert(typeof description === 'string' && description.length > 0);
        assert(Array.isArray(subcategories) && subcategories.every(s => s instanceof PerformanceTrackerCategory));

        this._code = code;
        this._description = description;
        this._categories = subcategories;

        registry.byCode.set(code, this);
    }

    get code() {
        return this._code;
    }

    get description() {
        return this._description;
    }

    get categories() {
        return this._categories;
    }

    /**
     * @public
     * @static
     * @returns {PerformanceTrackerCategory}
     */
    static get DEMO_PACKET_ANALYZER() {
        return demoPacketAnalyzer;
    }

    /**
     * @public
     * @static
     * @returns {PerformanceTrackerCategory}
     */
    static get DEMO_PACKET_EXTRACTOR() {
        return demoPacketExtractor;
    }

    /**
     * @public
     * @static
     * @returns {PerformanceTrackerCategory}
     */
    static get PARSER() {
        return parser;
    }
}

const demoPacketAnalyzer = new PerformanceTrackerCategory('DEMO_PACKET_ANALYZER', 'Analyzing of all demo packets and inner messages', [ ]);
const demoPacketExtractor = new PerformanceTrackerCategory('DEMO_PACKET_EXTRACTOR', 'Extraction of top-level demo packets', [ ]);

const parser = new PerformanceTrackerCategory('PARSER', 'Entire parse process', [ demoPacketAnalyzer, demoPacketExtractor ]);

module.exports = PerformanceTrackerCategory;
