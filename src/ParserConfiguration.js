const OPTIONS = {
    BATCHER_CHUNK_SIZE: 'batcherChunkSize',
    BATCHER_THRESHOLD_MILLISECONDS: 'batcherThresholdMilliseconds',
    PARSER_THREADS: 'parserThreads',
    SPLITTER_CHUNK_SIZE: 'splitterChunkSize'
};

const DEFAULTS = {
    [OPTIONS.BATCHER_CHUNK_SIZE]: 100 * 1024,
    [OPTIONS.BATCHER_THRESHOLD_MILLISECONDS]: 50,
    [OPTIONS.PARSER_THREADS]: 0,
    [OPTIONS.SPLITTER_CHUNK_SIZE]: 200 * 1024
};

class ParserConfiguration {
    /**
     * @constructor
     * @param {{ batcherChunkSize: number, batcherThresholdMilliseconds: number, parserThreads: number, splitterChunkSize: number }} options
     */
    constructor(options) {
        const getOption = key => options && options[key] ? options[key] : DEFAULTS[key];

        const batcherChunkSize = getOption(OPTIONS.BATCHER_CHUNK_SIZE);
        const batcherThresholdMilliseconds = getOption(OPTIONS.BATCHER_THRESHOLD_MILLISECONDS);

        const parserThreads = getOption(OPTIONS.PARSER_THREADS);

        const splitterChunkSize = getOption(OPTIONS.SPLITTER_CHUNK_SIZE);

        if (!Number.isInteger(batcherChunkSize) || batcherChunkSize <= 0) {
            throw new Error('options.batcherChunkSize must be a positive integer');
        }

        if (!Number.isInteger(batcherThresholdMilliseconds) || batcherThresholdMilliseconds <= 0) {
            throw new Error('options.batcherThresholdMilliseconds must be a positive integer');
        }

        if (!Number.isInteger(parserThreads) || parserThreads < 0) {
            throw new Error('options.parserThreads must be a not negative integer');
        }

        if (!Number.isInteger(splitterChunkSize) || splitterChunkSize <= 0) {
            throw new Error('options.splitterChunkSize must be a positive integer');
        }

        if (Number.isInteger(parserThreads) && parserThreads > 0) {
            throw new Error('Multithreading is not supported yet. Set parserThreads to 0');
        }

        this._batcherChunkSize = batcherChunkSize;
        this._batcherThresholdMilliseconds = batcherThresholdMilliseconds;

        this._parserThreads = parserThreads;

        this._splitterChunkSize = splitterChunkSize;
    }

    /**
     * @public
     * @returns {ParserConfiguration}
     */
    static get DEFAULT() {
        return defaultConfiguration;
    }

    /**
     * @public
     * @returns {number}
     */
    get batcherChunkSize() {
        return this._batcherChunkSize;
    }

    /**
     * @public
     * @returns {number}
     */
    get batcherThresholdMilliseconds() {
        return this._batcherThresholdMilliseconds;
    }

    /**
     * @public
     * @returns {number}
     */
    get parserThreads() {
        return this._parserThreads;
    }

    /**
     * @public
     * @returns {number}
     */
    get splitterChunkSize() {
        return this._splitterChunkSize;
    }
}

const defaultConfiguration = new ParserConfiguration({
    batcherChunkSize: DEFAULTS[OPTIONS.BATCHER_CHUNK_SIZE],
    batcherThresholdMilliseconds: DEFAULTS[OPTIONS.BATCHER_THRESHOLD_MILLISECONDS],
    parserThreads: DEFAULTS[OPTIONS.PARSER_THREADS],
    splitterChunkSize: DEFAULTS[OPTIONS.SPLITTER_CHUNK_SIZE]
});

export default ParserConfiguration;
