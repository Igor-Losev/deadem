import Assert from './../../core/Assert.js';

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
        Assert.isTrue(typeof code === 'string' && code.length > 0);
        Assert.isTrue(typeof description === 'string' && description.length > 0);
        Assert.isTrue(Array.isArray(subcategories) && subcategories.every(s => s instanceof PerformanceTrackerCategory));

        this._code = code;
        this._description = description;
        this._categories = subcategories;

        registry.byCode.set(code, this);
    }

    /**
     * @public
     * @returns {String}
     */
    get code() {
        return this._code;
    }

    /**
     * @public
     * @returns {String}
     */
    get description() {
        return this._description;
    }

    /**
     * @public
     * @returns {Array<PerformanceTrackerCategory>}
     */
    get categories() {
        return this._categories;
    }

    /**
     * @public
     * @static
     * @returns {PerformanceTrackerCategory}
     */
    static get ENTITY_READS() {
        return entityReads;
    }

    /**
     * @public
     * @static
     * @returns {PerformanceTrackerCategory}
     */
    static get DEMO_BUFFER_SPLITTER() {
        return demoBufferSplitter;
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
    static get DEMO_PACKET_PARSER() {
        return demoPacketParser;
    }

    /**
     * @public
     * @static
     * @returns {PerformanceTrackerCategory}
     */
    static get DEMO_PACKET_PRIORITIZER() {
        return demoPacketPrioritizer;
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

const entityReads = new PerformanceTrackerCategory('ENTITY_READS', 'Entity reads', [ ]);

const demoBufferSplitter = new PerformanceTrackerCategory('DEMO_BUFFER_SPLITTER', 'Splitting of big chunks into smaller parts', [ ]);
const demoPacketAnalyzer = new PerformanceTrackerCategory('DEMO_PACKET_ANALYZER', 'Analyzing of all demo packets and inner messages', [ entityReads ]);
const demoPacketExtractor = new PerformanceTrackerCategory('DEMO_PACKET_EXTRACTOR', 'Extraction of top-level demo packets', [ ]);
const demoPacketParser = new PerformanceTrackerCategory('DEMO_PACKET_PARSER', 'Parsing DemoPacketRaw packets into DemoPacket', [ ]);
const demoPacketPrioritizer = new PerformanceTrackerCategory('DEMO_PACKET_PRIORITIZER', 'Prioritization of message packets', [ ]);

const parser = new PerformanceTrackerCategory('PARSER', 'Entire parse process', [
    demoBufferSplitter,
    demoPacketAnalyzer,
    demoPacketExtractor,
    demoPacketParser,
    demoPacketPrioritizer
]);

export default PerformanceTrackerCategory;
