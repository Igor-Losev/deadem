import Assert from '#core/Assert.js';

import MessagePacketType from '#data/enums/MessagePacketType.js';

const OPTIONS = {
    BATCHER_CHUNK_SIZE: 'batcherChunkSize',
    BATCHER_THRESHOLD_MILLISECONDS: 'batcherThresholdMilliseconds',
    BREAK_INTERVAL: 'breakInterval',
    MESSAGE_PACKET_TYPES: 'messagePacketTypes',
    MESSAGE_PACKET_TYPES_EXCLUDE: 'messagePacketTypesExclude',
    PARSER_THREADS: 'parserThreads',
    SPLITTER_CHUNK_SIZE: 'splitterChunkSize'
};

const CRITICAL_MESSAGE_PACKET_TYPES = new Set([
    MessagePacketType.SVC_SERVER_INFO,
    MessagePacketType.SVC_CREATE_STRING_TABLE,
    MessagePacketType.SVC_UPDATE_STRING_TABLE,
    MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES
]);

const DEFAULTS = {
    [OPTIONS.BREAK_INTERVAL]: 1000,
    [OPTIONS.BATCHER_CHUNK_SIZE]: 100 * 1024,
    [OPTIONS.BATCHER_THRESHOLD_MILLISECONDS]: 50,
    [OPTIONS.MESSAGE_PACKET_TYPES]: null,
    [OPTIONS.MESSAGE_PACKET_TYPES_EXCLUDE]: null,
    [OPTIONS.PARSER_THREADS]: 0,
    [OPTIONS.SPLITTER_CHUNK_SIZE]: 200 * 1024
};

class ParserConfiguration {
    /**
     * @constructor
     * @param {{ batcherChunkSize?: number, batcherThresholdMilliseconds?: number, breakInterval?: number, messagePacketTypes?: Array<MessagePacketType>, messagePacketTypesExclude?: Array<MessagePacketType>, parserThreads?: number, splitterChunkSize?: number }} options
     */
    constructor(options) {
        const getOption = key => (options && options[key]) ? options[key] : DEFAULTS[key];

        const batcherChunkSize = getOption(OPTIONS.BATCHER_CHUNK_SIZE);
        const batcherThresholdMilliseconds = getOption(OPTIONS.BATCHER_THRESHOLD_MILLISECONDS);
        const breakInterval = getOption(OPTIONS.BREAK_INTERVAL);
        const messagePacketTypes = getOption(OPTIONS.MESSAGE_PACKET_TYPES);
        const messagePacketTypesExclude = getOption(OPTIONS.MESSAGE_PACKET_TYPES_EXCLUDE);
        const parserThreads = getOption(OPTIONS.PARSER_THREADS);
        const splitterChunkSize = getOption(OPTIONS.SPLITTER_CHUNK_SIZE);

        Assert.isTrue(Number.isInteger(batcherChunkSize) && batcherChunkSize > 0, 'options.batcherChunkSize must be a positive integer');
        Assert.isTrue(Number.isInteger(batcherThresholdMilliseconds) && batcherThresholdMilliseconds > 0, 'options.batcherThresholdMilliseconds must be a positive integer');
        Assert.isTrue(Number.isInteger(breakInterval) && breakInterval > 0, 'options.breakInterval must be a positive integer');
        Assert.isTrue(messagePacketTypes === null || Array.isArray(messagePacketTypes), 'options.messagePacketTypes must be an array or null');
        Assert.isTrue(messagePacketTypesExclude === null || Array.isArray(messagePacketTypesExclude), 'options.messagePacketTypesExclude must be an array or null');
        Assert.isTrue(messagePacketTypes === null || messagePacketTypesExclude === null, 'options.messagePacketTypes and options.messagePacketTypesExclude are mutually exclusive');
        Assert.isTrue(Number.isInteger(parserThreads) && parserThreads >= 0, 'options.parserThreads must be a not negative integer');
        Assert.isTrue(Number.isInteger(splitterChunkSize) && splitterChunkSize > 0, 'options.splitterChunkSize must be a positive integer');

        this._batcherChunkSize = batcherChunkSize;
        this._batcherThresholdMilliseconds = batcherThresholdMilliseconds;
        this._breakInterval = breakInterval;
        this._parserThreads = parserThreads;
        this._splitterChunkSize = splitterChunkSize;

        this._messagePacketFilter = buildMessagePacketFilter(messagePacketTypes, messagePacketTypesExclude);
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
    get breakInterval() {
        return this._breakInterval;
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

    /**
     * Returns whether a given message packet type ID should be processed.
     *
     * @public
     * @param {number} messagePacketTypeId
     * @returns {boolean}
     */
    getIsMessagePacketTypeAllowed(messagePacketTypeId) {
        return this._messagePacketFilter(messagePacketTypeId);
    }
}

/**
 * @param {Array<MessagePacketType>|null} include
 * @param {Array<MessagePacketType>|null} exclude
 * @returns {function(number): boolean}
 */
function buildMessagePacketFilter(include, exclude) {
    if (include !== null) {
        const allowed = new Set(include.map(t => t.id));

        for (const critical of CRITICAL_MESSAGE_PACKET_TYPES) {
            allowed.add(critical.id);
        }

        return (id) => allowed.has(id);
    }

    if (exclude !== null) {
        const denied = new Set(exclude.map(t => t.id));

        for (const critical of CRITICAL_MESSAGE_PACKET_TYPES) {
            denied.delete(critical.id);
        }

        return (id) => !denied.has(id);
    }

    return () => true;
}

const defaultConfiguration = new ParserConfiguration({ ...DEFAULTS });

export default ParserConfiguration;
