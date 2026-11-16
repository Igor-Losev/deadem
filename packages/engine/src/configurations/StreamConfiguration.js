import Assert from '../core/Assert.js';

const OPTIONS = /** @type {const} */ ({
    BREAK_INTERVAL: 'breakInterval',
    SPLITTER_CHUNK_SIZE: 'splitterChunkSize',
    STREAM_HIGH_WATER_MARK: 'streamHighWaterMark'
});

const DEFAULTS = {
    [OPTIONS.BREAK_INTERVAL]: 1000,
    [OPTIONS.SPLITTER_CHUNK_SIZE]: 200 * 1024,
    [OPTIONS.STREAM_HIGH_WATER_MARK]: 6
};

/**
 * @typedef {{ breakInterval?: number, splitterChunkSize?: number, streamHighWaterMark?: number }} StreamConfigurationOptions
 */

/**
 * Options of the read and write streams.
 */
class StreamConfiguration {
    /** @private @type {number} */
    _breakInterval;

    /** @private @type {number} */
    _splitterChunkSize;

    /** @private @type {number} */
    _streamHighWaterMark;

    /**
     * @public
     * @constructor
     * @param {StreamConfigurationOptions} [options]
    */
    constructor(options) {
        /**
         * @param {keyof StreamConfigurationOptions} key
         * @returns {number}
         */
        const getOption = key => (options && options[key]) ? options[key] : DEFAULTS[key];

        const breakInterval = getOption(OPTIONS.BREAK_INTERVAL);
        const splitterChunkSize = getOption(OPTIONS.SPLITTER_CHUNK_SIZE);
        const streamHighWaterMark = getOption(OPTIONS.STREAM_HIGH_WATER_MARK);

        Assert.isTrue(Number.isInteger(breakInterval) && breakInterval > 0, 'options.breakInterval must be a positive integer');
        Assert.isTrue(Number.isInteger(splitterChunkSize) && splitterChunkSize > 0, 'options.splitterChunkSize must be a positive integer');
        Assert.isTrue(Number.isInteger(streamHighWaterMark) && streamHighWaterMark > 0, 'options.streamHighWaterMark must be a positive integer');

        this._breakInterval = breakInterval;
        this._splitterChunkSize = splitterChunkSize;
        this._streamHighWaterMark = streamHighWaterMark;
    }

    /**
     * @public
     * @returns {number}
     */
    get breakInterval() {
        return this._breakInterval;
    }

    /**
     * @public
     * @returns {number}
     */
    get splitterChunkSize() {
        return this._splitterChunkSize;
    }

    /**
     * @public
     * @returns {number}
     */
    get streamHighWaterMark() {
        return this._streamHighWaterMark;
    }
}

export default StreamConfiguration;
